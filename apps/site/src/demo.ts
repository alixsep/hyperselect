interface Point {
  x: number
  y: number
}

const FINGERTIP: Point = { x: 15, y: 0 }
const easeOut = (t: number): number => 1 - (1 - t) ** 3
const easeInOut = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export function playDemo(sentence: HTMLElement, hand: SVGSVGElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const text = sentence.firstChild as Text
  let visible = false
  new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting), { threshold: 1 }).observe(sentence)

  void (async () => {
    for (;;) {
      await sleep(700)
      if (!visible || DemoSelection.offsetIn(text) === null) continue
      const round = new AbortController()
      await play(new DemoSelection(text, round), new Cursor(hand, round.signal))
    }
  })()
}

class DemoSelection {
  readonly text: Text
  private readonly round: AbortController
  private extent: number

  static offsetIn(text: Text): number | null {
    const selection = getSelection()
    if (!selection || selection.isCollapsed) return 0
    const ours = selection.anchorNode === text && selection.anchorOffset === 0 && selection.focusNode === text
    return ours ? selection.focusOffset : null
  }

  constructor(text: Text, round: AbortController) {
    this.text = text
    this.round = round
    this.extent = DemoSelection.offsetIn(text) ?? 0
  }

  get empty(): boolean {
    return this.extent === 0
  }

  extend(offset: number): void {
    if (!this.verify()) return
    this.extent = offset
    getSelection()?.setBaseAndExtent(this.text, 0, this.text, offset)
  }

  clear(): void {
    if (!this.verify()) return
    this.extent = 0
    getSelection()?.removeAllRanges()
  }

  verify(): boolean {
    if (DemoSelection.offsetIn(this.text) !== this.extent) this.round.abort()
    return !this.round.signal.aborted
  }
}

async function play(selection: DemoSelection, cursor: Cursor): Promise<void> {
  if (!selection.empty) await deselect(selection, cursor)
  await select(selection, cursor)
  await sleep(2000)
  await deselect(selection, cursor)
  await sleep(1200)
}

async function select(selection: DemoSelection, cursor: Cursor): Promise<void> {
  const { text } = selection
  const carets = caretsOf(text, cursor.container)
  await cursor.appear(carets[0]!)
  await cursor.press()
  await cursor.tween(1500, easeInOut, (t) => {
    const position = t * text.length
    const index = Math.floor(position)
    cursor.place(lerp(carets[index]!, carets[Math.min(index + 1, text.length)]!, position - index))
    selection.extend(Math.round(position))
  })
  await cursor.release()
  await cursor.move(restOf(carets.at(-1)!), 400)
}

async function deselect(selection: DemoSelection, cursor: Cursor): Promise<void> {
  if (!selection.verify()) return
  const end = caretsOf(selection.text, cursor.container).at(-1)!
  if (cursor.hidden) await cursor.appear(restOf(end))
  await cursor.move({ x: Math.min(cursor.container.clientWidth - 56, end.x + 150), y: end.y + 4 }, 650)
  await cursor.press()
  selection.clear()
  await cursor.release()
  await sleep(250)
  await cursor.move({ x: cursor.at.x + 14, y: cursor.at.y + 18 }, 400, 0)
}

const restOf = (end: Point): Point => ({ x: end.x + 22, y: end.y + 26 })

class Cursor {
  readonly container: HTMLElement
  private readonly hand: SVGSVGElement
  private readonly signal: AbortSignal
  private position: Point = { x: 0, y: 0 }

  constructor(hand: SVGSVGElement, signal: AbortSignal) {
    this.hand = hand
    this.signal = signal
    this.container = hand.parentElement!
    hand.style.scale = '1'
    signal.addEventListener('abort', () => this.vanish(), { once: true })
  }

  get hidden(): boolean {
    return Number(getComputedStyle(this.hand).opacity) < 0.5
  }

  get at(): Point {
    return this.position
  }

  place(point: Point): void {
    this.position = point
    this.hand.style.translate = `${point.x - FINGERTIP.x}px ${point.y - FINGERTIP.y}px`
  }

  move(to: Point, duration: number, opacity?: number): Promise<void> {
    const from = this.position
    const fade = Number(getComputedStyle(this.hand).opacity)
    return this.tween(duration, easeInOut, (t) => {
      this.place(lerp(from, to, t))
      if (opacity !== undefined) this.hand.style.opacity = String(fade + (opacity - fade) * t)
    })
  }

  appear(at: Point): Promise<void> {
    this.place({ x: at.x + 40, y: at.y + 44 })
    return this.move(at, 700, 1)
  }

  press(): Promise<void> {
    return this.tween(110, easeOut, (t) => (this.hand.style.scale = String(1 - 0.12 * t)))
  }

  release(): Promise<void> {
    return this.tween(130, easeOut, (t) => (this.hand.style.scale = String(0.88 + 0.12 * t)))
  }

  private vanish(): void {
    const opacity = getComputedStyle(this.hand).opacity
    this.hand.style.opacity = '0'
    this.hand.animate({ opacity: [opacity, '0'] }, { duration: 200 })
  }

  tween(duration: number, ease: (t: number) => number, frame: (t: number) => void): Promise<void> {
    return new Promise((resolve) => {
      const begin = performance.now()
      const step = (now: number) => {
        if (this.signal.aborted) return resolve()
        const t = Math.min(1, Math.max(0, (now - begin) / duration))
        frame(ease(t))
        if (t < 1) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
  }
}

function caretsOf(text: Text, container: Element): Point[] {
  const origin = container.getBoundingClientRect()
  const range = document.createRange()
  const carets: Point[] = []
  for (let i = 0; i <= text.length; i++) {
    const after = i === text.length
    range.setStart(text, after ? i - 1 : i)
    range.setEnd(text, after ? i : i + 1)
    const box = range.getClientRects()[0] ?? range.getBoundingClientRect()
    carets.push({ x: (after ? box.right : box.left) - origin.left, y: box.top + box.height * 0.62 - origin.top })
  }
  return carets
}
