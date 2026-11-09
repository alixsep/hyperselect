import { LINE_FLOATS, Lines, MAX_LINES } from './lines'
import { Pool, SPRITE_FLOATS } from './pool'
import { arrange, type Region } from './region'
import { type Frame, Renderer } from './renderer'
import { textLines } from './selection'
import { Stage } from './stage'
import type { Behavior, Preset, Theme } from './types'

const CAPACITY = 256
const MARGIN = 32
const MAX_DPR = 2

export interface HighlightOptions {
  preset: Preset
  theme?: Theme
}

export interface Highlight {
  setPreset(preset: Preset): void
  setTheme(theme: Theme): void
  setPaused(paused: boolean): void
  destroy(): void
}

class Mark implements Highlight {
  readonly canvas = document.createElement('canvas')
  readonly pool = new Pool(CAPACITY)
  readonly lines = new Lines()
  readonly sim = { pool: this.pool, lines: this.lines, dt: 0, time: 0 }
  visible = false
  paused = false
  width = 0
  height = 0
  private readonly context = this.canvas.getContext('2d')!
  private readonly style: string | null
  private readonly position: string
  private behavior: Behavior | undefined

  constructor(
    private readonly studio: Studio,
    readonly element: HTMLElement,
    public preset: Preset,
    private pinnedTheme: Theme | undefined,
  ) {
    this.style = element.getAttribute('style')
    this.position = getComputedStyle(element).position === 'static' ? 'position:relative;' : ''
    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.style.cssText = `position:absolute;left:-${MARGIN}px;top:-${MARGIN}px;width:calc(100% + ${2 * MARGIN}px);height:calc(100% + ${2 * MARGIN}px);pointer-events:none;z-index:-1`
    element.append(this.canvas)
    this.setPreset(preset)
  }

  setPreset(preset: Preset): void {
    this.preset = preset
    this.behavior = preset.behavior?.()
    this.pool.clear()
    this.lines.restart()
    this.restyle()
    this.studio.wake()
  }

  setTheme(theme: Theme): void {
    this.pinnedTheme = theme
    this.restyle()
    this.studio.wake()
  }

  setPaused(paused: boolean): void {
    this.paused = paused
    this.studio.wake()
  }

  get theme(): Theme {
    return this.pinnedTheme ?? this.studio.systemTheme
  }

  destroy(): void {
    this.canvas.remove()
    if (this.style === null) this.element.removeAttribute('style')
    else this.element.style.cssText = this.style
    this.studio.remove(this)
  }

  measure(): void {
    const origin = this.canvas.getBoundingClientRect()
    this.width = origin.width
    this.height = origin.height
    this.lines.sync(textLines(this.element, { x: origin.left, y: origin.top, scale: 1 }))
  }

  tick(dt: number, still: boolean): void {
    this.lines.step(still ? 1 : dt)
    if (still) return
    this.sim.dt = dt
    this.sim.time += dt
    const behavior = this.behavior
    if (!behavior) return
    for (const line of this.lines.all) if (!line.dead && !this.pool.full) behavior.emit(line, this.sim)
    this.pool.forEach(this.update)
  }

  show(atlas: HTMLCanvasElement, { x, y, width, height }: Region): void {
    if (this.canvas.parentNode !== this.element) this.element.append(this.canvas)
    if (this.canvas.width !== width) this.canvas.width = width
    if (this.canvas.height !== height) this.canvas.height = height
    this.context.clearRect(0, 0, width, height)
    this.context.drawImage(atlas, x, y, width, height, 0, 0, width, height)
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  restyle(): void {
    this.element.style.cssText = `${this.style ?? ''};${this.position}isolation:isolate;${this.preset.selection[this.theme]}`
  }

  private readonly update = (i: number): void => {
    this.pool.age[i] += this.sim.dt
    if (!this.behavior!.update(i, this.sim)) this.pool.kill(i)
  }
}

class Studio {
  private static shared: Studio | null | undefined
  private readonly marks = new Map<Element, Mark>()
  private readonly stage = new Stage()
  private readonly still = matchMedia('(prefers-reduced-motion: reduce)')
  private readonly forcedColors = matchMedia('(forced-colors: active)')
  private readonly lightScheme = matchMedia('(prefers-color-scheme: light)')
  private readonly listeners = new AbortController()
  private readonly sizes = new ResizeObserver((entries) => {
    for (const { target } of entries) this.marks.get(target)?.measure()
    this.wake()
  })
  private readonly sight = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const mark = this.marks.get(target)
      if (mark) mark.visible = isIntersecting
    }
    this.wake()
  })
  private readonly frame: Frame = {
    time: 0,
    fade: 1,
    light: 0,
    x: 0,
    y: 0,
    dpr: 1,
    lines: new Float32Array(MAX_LINES * LINE_FLOATS),
    lineCount: 0,
    sprites: new Float32Array(CAPACITY * SPRITE_FLOATS),
    spriteCount: 0,
  }
  private handle = 0
  private last = 0

  static get(): Studio | null {
    if (Studio.shared === undefined) Studio.shared = Studio.create()
    return Studio.shared
  }

  private static create(): Studio | null {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    const renderer = Renderer.create(canvas, CAPACITY)
    return renderer && new Studio(renderer, canvas)
  }

  private constructor(
    private readonly renderer: Renderer,
    private readonly canvas: HTMLCanvasElement,
  ) {
    const { signal } = this.listeners
    canvas.addEventListener('webglcontextlost', this.onContextLost, { signal })
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, { signal })
    this.forcedColors.addEventListener('change', () => this.wake(), { signal })
    this.lightScheme.addEventListener('change', this.retheme, { signal })
  }

  get systemTheme(): Theme {
    return this.lightScheme.matches ? 'light' : 'dark'
  }

  add(element: HTMLElement, preset: Preset, theme: Theme | undefined): Mark {
    this.marks.get(element)?.destroy()
    const mark = new Mark(this, element, preset, theme)
    this.marks.set(element, mark)
    this.sizes.observe(element)
    this.sight.observe(element)
    document.fonts.ready.then(() => {
      if (this.marks.get(element) !== mark) return
      mark.measure()
      this.wake()
    })
    return mark
  }

  remove(mark: Mark): void {
    if (this.marks.get(mark.element) !== mark) return
    this.marks.delete(mark.element)
    this.sizes.unobserve(mark.element)
    this.sight.unobserve(mark.element)
    queueMicrotask(() => this.marks.size || this.dispose())
  }

  wake(): void {
    if (this.handle || this.renderer.lost || !this.marks.size) return
    this.last = performance.now()
    this.handle = requestAnimationFrame(this.loop)
  }

  private dispose(): void {
    if (Studio.shared !== this) return
    Studio.shared = undefined
    cancelAnimationFrame(this.handle)
    this.listeners.abort()
    this.sizes.disconnect()
    this.sight.disconnect()
    this.renderer.dispose()
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault()
    cancelAnimationFrame(this.handle)
    this.handle = 0
  }

  private readonly onContextRestored = (): void => {
    this.renderer.restore()
    this.wake()
  }

  private readonly retheme = (): void => {
    for (const mark of this.marks.values()) mark.restyle()
    this.wake()
  }

  private readonly loop = (now: number): void => {
    this.handle = 0
    if (this.renderer.lost) return
    const dt = Math.min(Math.max(now - this.last, 0) / 1000, 1 / 20)
    this.last = now
    const still = this.still.matches
    const shown = [...this.marks.values()].filter((mark) => mark.visible && mark.width)
    if (this.forcedColors.matches) {
      for (const mark of shown) mark.clear()
      return
    }
    if (!shown.length) return
    for (const mark of shown) mark.tick(dt, still || mark.paused)
    this.paint(shown)
    if (!still && shown.some((mark) => !mark.paused)) this.handle = requestAnimationFrame(this.loop)
  }

  private paint(marks: Mark[]): void {
    const frame = this.frame
    frame.dpr = Math.min(devicePixelRatio || 1, MAX_DPR)
    const { slots, width, height } = arrange(marks.map((mark) => ({ width: Math.ceil(mark.width * frame.dpr), height: Math.ceil(mark.height * frame.dpr) })))
    this.renderer.begin(width, height, true)
    marks.forEach((mark, i) => {
      frame.time = mark.sim.time
      frame.light = mark.theme === 'light' ? 1 : 0
      frame.lineCount = mark.lines.pack(frame.lines, mark.element)
      frame.spriteCount = mark.pool.pack(frame.sprites)
      this.renderer.draw(mark.preset, frame, slots[i]!)
    })
    const staged = this.stage.capture(this.canvas)
    marks.forEach((mark, i) => mark.show(staged, slots[i]!))
  }
}

const inert: Highlight = { setPreset() {}, setTheme() {}, setPaused() {}, destroy() {} }

export function highlight(element: HTMLElement, { preset, theme }: HighlightOptions): Highlight {
  return Studio.get()?.add(element, preset, theme) ?? inert
}
