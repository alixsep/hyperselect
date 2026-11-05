export const SPRITE_FLOATS = 12

const floats = (n: number) => new Float32Array(n)
const DEFAULT_PARAMS = new Float32Array([1, 0, 0, 0])

export class Pool {
  readonly capacity: number
  readonly x: Float32Array
  readonly y: Float32Array
  readonly vx: Float32Array
  readonly vy: Float32Array
  readonly rot: Float32Array
  readonly spin: Float32Array
  readonly size: Float32Array
  readonly base: Float32Array
  readonly age: Float32Array
  readonly life: Float32Array
  readonly alpha: Float32Array
  readonly seed: Float32Array
  readonly params: Float32Array
  readonly kind: Uint8Array
  readonly line: Int32Array
  private readonly alive: Uint8Array
  private readonly free: number[] = []
  private top = 0
  count = 0

  constructor(capacity: number) {
    this.capacity = capacity
    this.x = floats(capacity)
    this.y = floats(capacity)
    this.vx = floats(capacity)
    this.vy = floats(capacity)
    this.rot = floats(capacity)
    this.spin = floats(capacity)
    this.size = floats(capacity)
    this.base = floats(capacity)
    this.age = floats(capacity)
    this.life = floats(capacity)
    this.alpha = floats(capacity)
    this.seed = floats(capacity)
    this.params = floats(capacity * 4)
    this.kind = new Uint8Array(capacity)
    this.line = new Int32Array(capacity)
    this.alive = new Uint8Array(capacity)
  }

  get full(): boolean {
    return this.count >= this.capacity
  }

  spawn(line: number): number {
    const i = this.free.length ? this.free.pop()! : this.top < this.capacity ? this.top++ : -1
    if (i < 0) return -1
    this.alive[i] = 1
    this.count++
    this.line[i] = line
    this.kind[i] = 0
    this.x[i] = this.y[i] = this.vx[i] = this.vy[i] = this.rot[i] = this.spin[i] = 0
    this.size[i] = this.age[i] = 0
    this.alpha[i] = 1
    this.seed[i] = Math.random()
    this.params.set(DEFAULT_PARAMS, i * 4)
    return i
  }

  kill(i: number): void {
    this.alive[i] = 0
    this.free.push(i)
    if (--this.count === 0) this.clear()
  }

  clear(): void {
    this.alive.fill(0)
    this.free.length = 0
    this.top = 0
    this.count = 0
  }

  move(i: number, dt: number): void {
    this.x[i] += this.vx[i] * dt
    this.y[i] += this.vy[i] * dt
  }

  forEach(visit: (i: number) => void): void {
    for (let i = 0; i < this.top; i++) if (this.alive[i]) visit(i)
  }

  pack(out: Float32Array, includes: (line: number) => boolean = () => true): number {
    let n = 0
    for (let i = 0; i < this.top; i++) {
      if (!this.alive[i] || !includes(this.line[i]!)) continue
      const o = n++ * SPRITE_FLOATS
      out[o] = this.x[i]
      out[o + 1] = this.y[i]
      out[o + 2] = this.size[i]
      out[o + 3] = this.rot[i]
      out[o + 4] = Math.min(1, this.age[i] / this.life[i])
      out[o + 5] = this.alpha[i]
      out[o + 6] = this.seed[i]
      out[o + 7] = this.kind[i]
      out[o + 8] = this.params[i * 4]
      out[o + 9] = this.params[i * 4 + 1]
      out[o + 10] = this.params[i * 4 + 2]
      out[o + 11] = this.params[i * 4 + 3]
    }
    return n
  }
}
