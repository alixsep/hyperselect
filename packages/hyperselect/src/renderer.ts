import { LINE_FLOATS, MAX_LINES } from './lines'
import { SPRITE_FLOATS } from './pool'
import { NOISE_CELLS, spriteShaders, surfaceShaders } from './shaders'
import type { Region } from './region'
import { swapsChannels } from './stage'
import type { Preset } from './types'

const QUAD = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5])
const COMPLETION_STATUS_KHR = 0x91b1
const SIZE_STEP = 256
const UNIFORMS = ['uTime', 'uFade', 'uLight', 'uSwap', 'uTint', 'uPad', 'uView'] as const

type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>

interface Program {
  readonly name: string
  readonly program: WebGLProgram
  readonly shaders: WebGLShader[]
  uniforms?: Uniforms
  broken?: boolean
}

interface Programs {
  readonly surface: Program
  readonly sprite?: Program
}

export interface Frame {
  time: number
  fade: number
  light: number
  x: number
  y: number
  dpr: number
  lines: Float32Array
  lineCount: number
  sprites: Float32Array
  spriteCount: number
}

export class Renderer {
  private readonly gl: WebGL2RenderingContext
  private parallel = false
  private readonly spriteCapacity: number
  private readonly programs = new Map<Preset, Programs>()
  private buffers: WebGLBuffer[] = []
  private noise: WebGLTexture | null = null
  private lineVao: WebGLVertexArrayObject | null = null
  private spriteVao: WebGLVertexArrayObject | null = null
  private lineBuffer: WebGLBuffer | null = null
  private spriteBuffer: WebGLBuffer | null = null
  private readonly stagingSwaps: boolean
  private swap = false

  static create(canvas: HTMLCanvasElement, spriteCapacity: number): Renderer | null {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false, depth: false, stencil: false })
    return gl ? new Renderer(gl, spriteCapacity) : null
  }

  private constructor(gl: WebGL2RenderingContext, spriteCapacity: number) {
    this.gl = gl
    this.spriteCapacity = spriteCapacity
    this.setup()
    this.stagingSwaps = this.probeStaging()
  }

  get lost(): boolean {
    return this.gl.isContextLost()
  }

  restore(): void {
    this.programs.clear()
    this.setup()
  }

  prepare(preset: Preset): void {
    if (this.programs.has(preset)) return
    const sprite = spriteShaders(preset)
    this.programs.set(preset, {
      surface: this.compile(`${preset.name} surface`, surfaceShaders(preset)),
      sprite: sprite && this.compile(`${preset.name} sprite`, sprite),
    })
  }

  ready(preset: Preset): boolean {
    this.prepare(preset)
    const { surface, sprite } = this.programs.get(preset)!
    return this.linked(surface) && (!sprite || this.linked(sprite))
  }

  compiling(preset: Preset): boolean {
    if (this.ready(preset)) return false
    const { surface, sprite } = this.programs.get(preset)!
    return !surface.broken && !sprite?.broken
  }

  begin(width: number, height: number, staged = false): void {
    const gl = this.gl
    this.swap = staged && this.stagingSwaps
    width = Math.ceil(width / SIZE_STEP) * SIZE_STEP
    height = Math.ceil(height / SIZE_STEP) * SIZE_STEP
    if (gl.canvas.width !== width) gl.canvas.width = width
    if (gl.canvas.height !== height) gl.canvas.height = height
    gl.viewport(0, 0, width, height)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  draw(preset: Preset, frame: Frame, slot: Region): void {
    const gl = this.gl
    if ((!frame.lineCount && !frame.spriteCount) || !this.ready(preset)) return
    const { surface, sprite } = this.programs.get(preset)!
    gl.viewport(slot.x, gl.canvas.height - slot.y - slot.height, slot.width, slot.height)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.lines, 0, frame.lineCount * LINE_FLOATS)
    if (frame.lineCount) {
      this.use(surface, preset, frame, slot)
      gl.bindVertexArray(this.lineVao)
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, frame.lineCount)
    }
    if (sprite && frame.spriteCount) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.spriteBuffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, frame.sprites, 0, frame.spriteCount * SPRITE_FLOATS)
      this.use(sprite, preset, frame, slot)
      gl.bindVertexArray(this.spriteVao)
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, frame.spriteCount)
    }
    gl.bindVertexArray(null)
  }

  dispose(): void {
    const gl = this.gl
    for (const { surface, sprite } of this.programs.values()) for (const p of [surface, sprite]) if (p) gl.deleteProgram(p.program)
    for (const buffer of this.buffers) gl.deleteBuffer(buffer)
    gl.deleteVertexArray(this.lineVao)
    gl.deleteVertexArray(this.spriteVao)
    gl.deleteTexture(this.noise)
    this.programs.clear()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  private setup(): void {
    const gl = this.gl
    this.parallel = !!gl.getExtension('KHR_parallel_shader_compile')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)
    this.buffers = []
    const quad = this.buffer(QUAD, gl.STATIC_DRAW)
    this.lineBuffer = this.buffer(new Float32Array(MAX_LINES * LINE_FLOATS), gl.DYNAMIC_DRAW)
    this.spriteBuffer = this.buffer(new Float32Array(this.spriteCapacity * SPRITE_FLOATS), gl.DYNAMIC_DRAW)
    this.lineVao = this.vertexArray(quad, this.lineBuffer, [4, 4])
    this.spriteVao = this.vertexArray(quad, this.spriteBuffer, [4, 4, 4])
    this.noise = this.noiseTexture()
  }

  private noiseTexture(): WebGLTexture {
    const gl = this.gl
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, NOISE_CELLS, NOISE_CELLS, 0, gl.RG, gl.FLOAT, Float32Array.from({ length: NOISE_CELLS ** 2 * 2 }, Math.random))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return texture
  }

  private buffer(data: Float32Array, usage: number): WebGLBuffer {
    const gl = this.gl
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, usage)
    this.buffers.push(buffer)
    return buffer
  }

  private vertexArray(quad: WebGLBuffer, instances: WebGLBuffer, sizes: number[]): WebGLVertexArrayObject {
    const gl = this.gl
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, instances)
    const stride = sizes.reduce((a, b) => a + b) * 4
    let offset = 0
    sizes.forEach((size, n) => {
      gl.enableVertexAttribArray(n + 1)
      gl.vertexAttribPointer(n + 1, size, gl.FLOAT, false, stride, offset)
      gl.vertexAttribDivisor(n + 1, 1)
      offset += size * 4
    })
    gl.bindVertexArray(null)
    return vao
  }

  private compile(name: string, [vertex, fragment]: [string, string]): Program {
    const gl = this.gl
    const program = gl.createProgram()
    const shaders = [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ].map(([type, source]) => {
      const shader = gl.createShader(type as number)!
      gl.shaderSource(shader, source as string)
      gl.compileShader(shader)
      gl.attachShader(program, shader)
      return shader
    })
    gl.linkProgram(program)
    return { name, program, shaders }
  }

  private linked(p: Program): boolean {
    const gl = this.gl
    if (p.uniforms) return true
    if (p.broken) return false
    if (this.parallel && !gl.getProgramParameter(p.program, COMPLETION_STATUS_KHR)) return false
    if (!gl.getProgramParameter(p.program, gl.LINK_STATUS)) {
      p.broken = true
      const log = p.shaders.map((s) => gl.getShaderInfoLog(s)).join('\n') || gl.getProgramInfoLog(p.program)
      console.error(`hyperselect: the ${p.name} shader failed to compile\n${log}`)
      return false
    }
    for (const shader of p.shaders) gl.deleteShader(shader)
    p.uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(p.program, name)])) as Uniforms
    return true
  }

  private probeStaging(): boolean {
    const gl = this.gl
    this.begin(1, 1)
    gl.clearColor(1, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.clearColor(0, 0, 0, 0)
    return swapsChannels(gl.canvas as HTMLCanvasElement)
  }

  private use(p: Program, preset: Preset, frame: Frame, slot: Region): void {
    const gl = this.gl
    const u = p.uniforms!
    gl.useProgram(p.program)
    gl.uniform1f(u.uTime, frame.time)
    gl.uniform1f(u.uFade, frame.fade)
    gl.uniform1f(u.uLight, frame.light)
    gl.uniform1f(u.uSwap, this.swap ? 1 : 0)
    gl.uniform3f(u.uTint, ...preset.tint)
    gl.uniform3f(u.uPad, ...preset.pad)
    gl.uniform4f(u.uView, frame.x, frame.y, slot.width / frame.dpr, slot.height / frame.dpr)
  }
}
