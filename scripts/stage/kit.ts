import { categories } from '@hyperselect/presets'
import type { Preset } from 'hyperselect'

export interface Point {
  readonly x: number
  readonly y: number
}

export const byName: Record<string, Preset> = Object.assign({}, ...Object.values(categories))

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))
export const progress = (t: number, from: number, to: number): number => clamp01((t - from) / (to - from))
export const easeOut = (x: number): number => 1 - (1 - x) ** 4
export const easeInOut = (x: number): number => (x < 0.5 ? 4 * x ** 3 : 1 - (2 - 2 * x) ** 3 / 2)
export const lerp = (a: Point, b: Point, x: number): Point => ({ x: a.x + (b.x - a.x) * x, y: a.y + (b.y - a.y) * x })

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text = ''): HTMLElementTagNameMap[K] {
  return Object.assign(document.createElement(tag), { className, textContent: text })
}

export const moveTo = (target: HTMLElement, { x, y }: Point): void => {
  target.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
}

export function selectTo(node: Node, offset: number): void {
  const selection = document.getSelection()!
  if (!offset) return selection.removeAllRanges()
  if (selection.focusNode !== node || selection.focusOffset !== offset) selection.setBaseAndExtent(node, 0, node, offset)
}

export function caretAt(node: Node, offset: number): Point {
  const length = node.textContent!.length
  const before = offset >= length
  const range = document.createRange()
  range.setStart(node, before ? length - 1 : offset)
  range.setEnd(node, before ? length : offset + 1)
  const rect = range.getBoundingClientRect()
  return { x: before ? rect.right : rect.left, y: rect.top + rect.height * 0.62 }
}

export async function play(update: (seconds: number) => void, pace = 1): Promise<void> {
  await Promise.all(['16px "Fraunces Variable"', 'italic 16px "Fraunces Variable"', '16px "Inter Variable"'].map((font) => document.fonts.load(font)))
  let origin: number | undefined
  const frame = (time: number): void => {
    origin ??= time
    update((time - origin) / 1000 / pace)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
