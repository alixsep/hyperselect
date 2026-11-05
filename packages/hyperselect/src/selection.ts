import type { Rect } from './lines'
import type { Origin } from './region'
import type { Theme } from './types'

const MERGE_GAP = 40
const IGNORED = '[data-hyperselect-ignore]'

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

const EVERYWHERE: Box = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }

export type Look = Theme | 'native' | null

export interface Selected {
  readonly rects: Rect[]
  readonly elements: Map<HTMLElement, Look>
  readonly hosts: Map<HTMLElement, Theme | null>
}

export interface Padding {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
}

export function toPadding(value: number | Partial<Padding> = 0): Padding {
  const sides = typeof value === 'number' ? { top: value, right: value, bottom: value, left: value } : value
  return { top: 0, right: 0, bottom: 0, left: 0, ...sides }
}

export function readSelection(root: Node, padding: Padding, originOf: (host: HTMLElement) => Origin): Selected {
  const rects: Rect[] = []
  const elements = new Map<HTMLElement, Look>()
  const hosts = new Map<HTMLElement, Theme | null>()
  const selection = document.getSelection()
  if (!selection || selection.isCollapsed) return { rects, elements, hosts }
  const band = { ...EVERYWHERE, top: -innerHeight, bottom: 2 * innerHeight }
  const clips = new Map<Element, Box>()
  const lineHeights = new Map<Element, number>()
  const backdrops = new Map<Element, Backdrop>()
  const origins = new Map<HTMLElement, Origin>()
  const page = backdropOf(null, backdrops)
  const selectables = new Map<Element, boolean>()
  const probe = document.createRange()
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i)
    for (const node of selectedText(range, root)) {
      const parent = node.parentElement!
      if (hidden(parent) || !selectable(parent, selectables)) continue
      const backdrop = backdropOf(parent, backdrops)
      if (backdrop.warped || vertical(parent) || parent.closest(IGNORED)) {
        elements.set(parent, 'native')
        continue
      }
      elements.set(parent, backdrop.element === page.element ? null : (themeOf(getComputedStyle(parent).color, 'text') ?? backdrop.theme))
      hosts.set(backdrop.element, backdrop.theme)
      let origin = origins.get(backdrop.element)
      if (!origin) origins.set(backdrop.element, (origin = originOf(backdrop.element)))
      const clip = intersect(band, clipOf(parent, clips))
      let lineHeight = lineHeights.get(parent)
      if (lineHeight === undefined) lineHeights.set(parent, (lineHeight = lineHeightOf(parent)))
      probe.selectNodeContents(node)
      if (node === range.startContainer) probe.setStart(node, paintedStart(node, range.startOffset))
      if (node === range.endContainer) probe.setEnd(node, range.endOffset)
      for (const box of lineBoxes(probe, lineHeight, clip)) rects.push(toRect(box, origin, backdrop.element))
    }
  }
  return { rects: padLines(mergeLines(rects), padding), elements, hosts }
}

export function textLines(element: HTMLElement, origin: Origin): Rect[] {
  const rects: Rect[] = []
  const probe = document.createRange()
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node as Text).data.trim()) continue
    probe.selectNodeContents(node)
    for (const box of lineBoxes(probe, lineHeightOf(node.parentElement!), EVERYWHERE)) rects.push(toRect(box, origin, element))
  }
  return mergeLines(rects)
}

function* lineBoxes(range: Range, lineHeight: number, clip: Box): Generator<Box> {
  for (const r of range.getClientRects()) {
    if (r.width < 1 || r.height < 1) continue
    const h = Math.max(r.height, lineHeight)
    const top = r.top - (h - r.height) / 2
    const box = intersect(clip, { left: r.left, top, right: r.right, bottom: top + h })
    if (box.right - box.left >= 1 && box.bottom - box.top >= 1) yield box
  }
}

const toRect = (box: Box, { x, y, scale }: Origin, backdrop: HTMLElement): Rect => ({
  x: (box.left - x) / scale,
  y: (box.top - y) / scale,
  w: (box.right - box.left) / scale,
  h: (box.bottom - box.top) / scale,
  backdrop,
})

export function mergeLines(rects: readonly Rect[]): Rect[] {
  const lines: Rect[] = []
  for (const rect of rects) {
    const center = rect.y + rect.h / 2
    const line = lines.find(
      (l) =>
        l.backdrop === rect.backdrop &&
        Math.max(l.h, rect.h) < Math.min(l.h, rect.h) * 1.5 &&
        Math.abs(l.y + l.h / 2 - center) < Math.min(l.h, rect.h) / 2 &&
        rect.x < l.x + l.w + MERGE_GAP &&
        rect.x + rect.w > l.x - MERGE_GAP,
    )
    if (!line) {
      lines.push({ ...rect })
      continue
    }
    const right = Math.max(line.x + line.w, rect.x + rect.w)
    const bottom = Math.max(line.y + line.h, rect.y + rect.h)
    line.x = Math.min(line.x, rect.x)
    line.y = Math.min(line.y, rect.y)
    line.w = right - line.x
    line.h = bottom - line.y
  }
  return lines.sort((a, b) => a.y - b.y || a.x - b.x)
}

export function padLines(lines: readonly Rect[], padding: Padding): Rect[] {
  const widened = lines.map((line) => {
    const [x, w] = grow(line.x, line.w, padding.left, padding.right)
    return { ...line, x, w }
  })
  return widened.map((line) => {
    let top = padding.top
    let bottom = padding.bottom
    for (const other of widened) {
      if (other.x >= line.x + line.w || other.x + other.w <= line.x) continue
      const above = line.y - (other.y + other.h)
      const below = other.y - (line.y + line.h)
      if (above >= 0) top = Math.min(top, above / 2)
      if (below >= 0) bottom = Math.min(bottom, below / 2)
    }
    const [y, h] = grow(line.y, line.h, top, bottom)
    return { ...line, y, h }
  })
}

function grow(start: number, size: number, before: number, after: number): [start: number, size: number] {
  const wanted = size + before + after
  const grown = Math.max(1, wanted)
  return [start - before - (grown - wanted) / 2, grown]
}

function lineHeightOf(element: HTMLElement): number {
  const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 0
  const height = element.offsetHeight
  return height ? (lineHeight * element.getBoundingClientRect().height) / height : lineHeight
}

// Chromium paints a styled ::first-letter as selected when the selection starts right after it.
const chromium = typeof navigator !== 'undefined' && navigator.vendor === 'Google Inc.'

function paintedStart(node: Text, offset: number): number {
  return chromium && offset > 0 && offset === firstLetterEnd(node) ? 0 : offset
}

function firstLetterEnd(node: Text): number {
  const parent = node.parentElement!
  if (node !== parent.firstChild) return -1
  const letter = getComputedStyle(parent, '::first-letter')
  const text = getComputedStyle(parent)
  if (letter.fontSize === text.fontSize && letter.float === text.float && letter.color === text.color) return -1
  return /^\s*\p{P}*\S\p{P}*/u.exec(node.data)?.[0].length ?? -1
}

const hidden = (element: HTMLElement): boolean => getComputedStyle(element).visibility !== 'visible' || element.closest('[inert]') !== null

function selectable(element: HTMLElement | null, cache: Map<Element, boolean>): boolean {
  if (!element) return true
  let result = cache.get(element)
  if (result !== undefined) return result
  const { userSelect, webkitUserSelect } = getComputedStyle(element)
  const choice = userSelect || webkitUserSelect
  result = choice !== 'none' && (/text|all|contain/.test(choice) || selectable(element.parentElement, cache))
  cache.set(element, result)
  return result
}

interface Backdrop {
  readonly element: HTMLElement
  readonly warped: boolean
  readonly theme: Theme | null
}

function backdropOf(element: HTMLElement | null, cache: Map<Element, Backdrop>): Backdrop {
  if (!element || element === document.body) {
    let page = cache.get(document.body)
    if (!page) cache.set(document.body, (page = { element: pageHost(), warped: false, theme: null }))
    return page
  }
  let backdrop = cache.get(element)
  if (backdrop) return backdrop
  const outer = backdropOf(element.parentElement, cache)
  const style = getComputedStyle(element)
  const painted = paints(style)
  backdrop = {
    element: painted ? element : outer.element,
    warped: outer.warped || warped(style),
    theme: (painted && ownTheme(style)) || outer.theme,
  }
  cache.set(element, backdrop)
  return backdrop
}

function pageHost(): HTMLElement {
  const { body, documentElement } = document
  return paints(getComputedStyle(documentElement)) && paints(getComputedStyle(body)) ? body : documentElement
}

function warped({ transform, rotate, scale }: CSSStyleDeclaration): boolean {
  if (rotate !== 'none' && rotate !== '0deg') return true
  const [x = 1, y = x] = scale === 'none' ? [] : scale.split(' ').map(Number)
  if (!uniform(x, y)) return true
  if (transform === 'none') return false
  const { is2D, a, b, c, d } = new DOMMatrixReadOnly(transform)
  return !is2D || b !== 0 || c !== 0 || !uniform(a, d)
}

const uniform = (x: number, y: number): boolean => x > 0 && x === y

const vertical = (element: HTMLElement): boolean => !getComputedStyle(element).writingMode.startsWith('horizontal')

export const paints = (style: Pick<CSSStyleDeclaration, 'backgroundColor' | 'backgroundImage'>): boolean =>
  style.backgroundImage !== 'none' || !/^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(style.backgroundColor)

function clipOf(element: Element | null, cache: Map<Element, Box>): Box {
  if (!element || element === document.body || element === document.documentElement) return EVERYWHERE
  let clip = cache.get(element)
  if (clip) return clip
  clip = clipOf(element.parentElement, cache)
  const { overflowX, overflowY } = getComputedStyle(element)
  if (overflowX !== 'visible' || overflowY !== 'visible') {
    const r = element.getBoundingClientRect()
    const left = r.left + element.clientLeft
    const top = r.top + element.clientTop
    clip = intersect(clip, { left, top, right: left + element.clientWidth, bottom: top + element.clientHeight })
  }
  cache.set(element, clip)
  return clip
}

function intersect(a: Box, b: Box): Box {
  return { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) }
}

function* selectedText(range: Range, root: Node): Generator<Text> {
  const ancestor = range.commonAncestorContainer
  if (ancestor instanceof Text) {
    if (root.contains(ancestor) && ancestor.data.trim() && ancestor.parentElement) yield ancestor
    return
  }
  const scope = root.contains(ancestor) ? ancestor : ancestor.contains(root) ? root : null
  if (!scope) return
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    if (text.parentElement && text.data.trim() && range.intersectsNode(text)) yield text
  }
}

const luminances = new Map<string, number | null>()
let swatch: OffscreenCanvasRenderingContext2D | undefined

const ownTheme = (style: CSSStyleDeclaration): Theme | null =>
  (style.backgroundImage === 'none' ? themeOf(style.backgroundColor, 'background') : null) ?? themeOf(style.color, 'text')

function themeOf(color: string, layer: 'background' | 'text'): Theme | null {
  const luminance = luminanceOf(color)
  if (luminance === null || Math.abs(luminance - 0.5) < 0.15) return null
  return luminance > 0.5 === (layer === 'background') ? 'light' : 'dark'
}

function luminanceOf(color: string): number | null {
  let luminance = luminances.get(color)
  if (luminance !== undefined) return luminance
  swatch ??= new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })!
  swatch.clearRect(0, 0, 1, 1)
  swatch.fillStyle = color
  swatch.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data
  luminance = a < 128 ? null : (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  luminances.set(color, luminance)
  return luminance
}
