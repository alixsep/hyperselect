export class Stage {
  private readonly canvas = document.createElement('canvas')
  private readonly context = this.canvas.getContext('2d')!

  capture(source: HTMLCanvasElement): HTMLCanvasElement {
    if (this.canvas.width !== source.width) this.canvas.width = source.width
    if (this.canvas.height !== source.height) this.canvas.height = source.height
    this.context.globalCompositeOperation = 'copy'
    this.context.drawImage(source, 0, 0)
    return this.canvas
  }
}
