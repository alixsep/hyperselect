import type { Origin, Region } from './region'

export class Layer {
  private readonly element = document.createElement('div')
  private readonly own = document.createElement('canvas')
  private readonly context: CanvasRenderingContext2D = this.own.getContext('2d')!
  private readonly isolated: boolean
  private readonly styled: boolean
  private x = 0
  private y = 0
  private width = 1
  private height = 1
  drawn = false

  constructor(
    readonly host: HTMLElement,
    zIndex: number,
  ) {
    this.element.setAttribute('aria-hidden', 'true')
    this.element.style.cssText = `position:absolute;left:0;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;z-index:${zIndex}`
    this.own.style.cssText = 'display:block;width:100%;height:100%'
    this.element.append(this.own)
    this.isolated = host === document.documentElement || host.style.isolation === 'isolate'
    this.styled = host.hasAttribute('style')
    if (!this.isolated) host.style.isolation = 'isolate'
    host.append(this.element)
  }

  set hidden(hidden: boolean) {
    this.element.style.display = hidden ? 'none' : ''
  }

  owns(node: Node): boolean {
    return node === this.element || node === this.own
  }

  // Inside the selected range the layer would stretch the selection bounds that mobile browsers place their menu by.
  attach(range?: Range): void {
    if (this.element.parentNode !== this.host) this.host.append(this.element)
    if (!range?.intersectsNode(this.element)) return
    if (range.comparePoint(this.host, 0) < 0) this.host.prepend(this.element)
    else if (range.comparePoint(this.host, this.host.childNodes.length) > 0) this.host.append(this.element)
  }

  origin(): Origin {
    const rect = this.element.getBoundingClientRect()
    const scale = rect.width / this.width || 1
    return { x: rect.left - this.x * scale, y: rect.top - this.y * scale, scale }
  }

  fit(region: Region): Region {
    const contains =
      region.x >= this.x && region.y >= this.y && region.x + region.width <= this.x + this.width && region.y + region.height <= this.y + this.height
    const snug = this.width * this.height <= 2 * region.width * region.height
    return contains && snug ? { x: this.x, y: this.y, width: this.width, height: this.height } : region
  }

  cover({ x, y, width, height }: Region): void {
    if (width !== this.width || height !== this.height) {
      this.width = width
      this.height = height
      this.element.style.width = `${width}px`
      this.element.style.height = `${height}px`
    }
    if (x === this.x && y === this.y) return
    this.x = x
    this.y = y
    this.element.style.translate = `${x}px ${y}px`
  }

  show(atlas: HTMLCanvasElement, { x, y, width, height }: Region): void {
    this.use(this.own)
    if (this.own.width !== width) this.own.width = width
    if (this.own.height !== height) this.own.height = height
    this.context.globalCompositeOperation = 'copy'
    this.context.drawImage(atlas, x, y, width, height, 0, 0, width, height)
    this.drawn = true
  }

  present(atlas: HTMLCanvasElement, slot: Region): void {
    this.use(atlas)
    const width = `${(atlas.width * this.width) / slot.width}px`
    const height = `${(atlas.height * this.height) / slot.height}px`
    if (atlas.style.width !== width) atlas.style.width = width
    if (atlas.style.height !== height) atlas.style.height = height
    this.drawn = true
  }

  clear(): void {
    this.use(this.own)
    this.context.clearRect(0, 0, this.own.width, this.own.height)
    this.drawn = false
  }

  remove(): void {
    this.element.remove()
    if (this.isolated) return
    this.host.style.removeProperty('isolation')
    if (!this.styled && !this.host.style.length) this.host.removeAttribute('style')
  }

  private use(surface: HTMLCanvasElement): void {
    if (surface.parentNode !== this.element) this.element.replaceChildren(surface)
  }
}
