const SAMPLES = 32
const TOLERANCE = 0.25

export class Tracker {
  private readonly elements: HTMLElement[] = []
  private readonly boxes = new Float64Array(SAMPLES * 4)

  watch(elements: Iterable<HTMLElement>): void {
    const all = [...elements]
    const count = Math.min(all.length, SAMPLES)
    this.elements.length = 0
    for (let i = 0; i < count; i++) this.elements.push(all[count > 1 ? Math.round((i * (all.length - 1)) / (count - 1)) : 0]!)
    this.moved()
  }

  moved(): boolean {
    let moved = false
    for (const [i, element] of this.elements.entries()) {
      const { left, top, width, height } = element.getBoundingClientRect()
      moved = this.update(i * 4, left + scrollX, top + scrollY, width, height) || moved
    }
    return moved
  }

  private update(o: number, x: number, y: number, w: number, h: number): boolean {
    const box = this.boxes
    const same = Math.abs(box[o]! - x) < TOLERANCE && Math.abs(box[o + 1]! - y) < TOLERANCE && Math.abs(box[o + 2]! - w) < TOLERANCE && Math.abs(box[o + 3]! - h) < TOLERANCE
    box[o] = x
    box[o + 1] = y
    box[o + 2] = w
    box[o + 3] = h
    return !same
  }
}
