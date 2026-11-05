import type { Region } from './region'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
  backdrop: HTMLElement
}

export interface Line extends Rect {
  readonly id: number
  readonly seed: number
  age: number
  alpha: number
  cover: number
  dead: boolean
}

export const MAX_LINES = 128
export const LINE_FLOATS = 8

export class Lines {
  readonly all: Line[] = []
  private readonly byId = new Map<number, Line>()
  private nextId = 1

  get(id: number): Line | undefined {
    return this.byId.get(id)
  }

  sync(rects: readonly Rect[]): void {
    const matched = new Set<Line>()
    for (const rect of rects) {
      const line = this.closest(rect, matched) ?? this.add(rect)
      if (!line) continue
      matched.add(line)
      line.x = rect.x
      line.y = rect.y
      line.w = rect.w
      line.h = rect.h
      line.dead = false
    }
    for (const line of this.all) if (!matched.has(line)) line.dead = true
    this.all.sort((a, b) => a.y - b.y)
  }

  step(dt: number): void {
    const k = 1 - Math.exp(-dt * 10)
    for (let n = this.all.length - 1; n >= 0; n--) {
      const line = this.all[n]!
      line.age += dt
      line.alpha += ((line.dead ? 0 : 1) - line.alpha) * k
      if (line.dead && line.alpha < 0.01) {
        this.all.splice(n, 1)
        this.byId.delete(line.id)
        continue
      }
      const cover = this.topCovered(line) ? 1 : 0
      line.cover = line.age > dt ? line.cover + (cover - line.cover) * k : cover
    }
  }

  restart(): void {
    for (const line of this.all) line.age = 0
  }

  edgeCovered(line: Line, top: boolean, x: number): boolean {
    const probe = top ? line.y - 5 : line.y + line.h + 5
    for (const other of this.all) {
      if (other !== line && !other.dead && other.backdrop === line.backdrop && x >= other.x - 2 && x <= other.x + other.w + 2 && this.spans(other, probe)) return true
    }
    return false
  }

  area([side, top, bottom]: readonly [number, number, number], { x, y, width, height }: Region, backdrop: HTMLElement): number {
    let area = 0
    for (const line of this.all) {
      if (line.backdrop !== backdrop) continue
      const w = Math.min(line.x + line.w + side, x + width) - Math.max(line.x - side, x)
      const h = Math.min(line.y + line.h + bottom, y + height) - Math.max(line.y - top, y)
      if (w > 0 && h > 0) area += w * h
    }
    return area
  }

  pack(out: Float32Array, backdrop: HTMLElement): number {
    let count = 0
    for (const line of this.all) {
      if (line.backdrop !== backdrop) continue
      if (count === MAX_LINES) break
      const o = count++ * LINE_FLOATS
      out[o] = line.x
      out[o + 1] = line.y
      out[o + 2] = line.w
      out[o + 3] = line.h
      out[o + 4] = line.age
      out[o + 5] = line.alpha
      out[o + 6] = line.seed
      out[o + 7] = line.cover
    }
    return count
  }

  private topCovered(line: Line): boolean {
    const probe = line.y - 5
    for (const other of this.all) {
      if (other !== line && !other.dead && other.backdrop === line.backdrop && other.x < line.x + line.w && other.x + other.w > line.x && this.spans(other, probe)) return true
    }
    return false
  }

  private spans(line: Line, y: number): boolean {
    return y >= line.y - 4 && y <= line.y + line.h + 4
  }

  private closest(rect: Rect, taken: ReadonlySet<Line>): Line | undefined {
    let best: Line | undefined
    let bestDistance = Infinity
    for (const line of this.all) {
      if (taken.has(line) || line.backdrop !== rect.backdrop) continue
      const distance = Math.abs(line.y - rect.y) + Math.abs(line.h - rect.h) / 2
      if (distance < Math.max(line.h, rect.h) * 0.6 && distance < bestDistance) {
        best = line
        bestDistance = distance
      }
    }
    return best
  }

  private add(rect: Rect): Line | undefined {
    if (this.all.length >= MAX_LINES) return undefined
    const line: Line = { ...rect, id: this.nextId++, seed: Math.random(), age: 0, alpha: 0, cover: 0, dead: false }
    this.all.push(line)
    this.byId.set(line.id, line)
    return line
  }
}
