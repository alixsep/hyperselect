// Firefox's accelerated 2D canvas swaps red and blue when it copies from WebGL.
export function swapsChannels(source: HTMLCanvasElement): boolean {
  const probe = document.createElement('canvas')
  probe.width = source.width
  probe.height = source.height
  const context = probe.getContext('2d')!
  context.drawImage(source, 0, 0)
  const [red, , blue] = context.getImageData(0, 0, 1, 1).data
  return blue! > red!
}

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
