import { LINE_FLOATS } from './lines'
import { SPRITE_FLOATS } from './pool'
import type { Frame } from './renderer'

const GRID = 32
const ATLAS_WIDTH = 2048

export interface Region {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export interface Origin {
  readonly x: number
  readonly y: number
  readonly scale: number
}

export const toLocal = ({ x, y, width, height }: Region, origin: Origin): Region => ({
  x: (x - origin.x) / origin.scale,
  y: (y - origin.y) / origin.scale,
  width: width / origin.scale,
  height: height / origin.scale,
})

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

export const clips = ({ overflowX, overflowY }: CSSStyleDeclaration): boolean => overflowX !== 'visible' || overflowY !== 'visible'

export function paddingBox(element: Element): Box {
  const r = element.getBoundingClientRect()
  const left = r.left + element.clientLeft
  const top = r.top + element.clientTop
  return { left, top, right: left + element.clientWidth, bottom: top + element.clientHeight }
}

export function intersect(a: Box, b: Box): Box {
  return { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) }
}

export function visiblePart(host: HTMLElement, { x, y, width, height }: Region): Region {
  let box: Box = { left: x, top: y, right: x + width, bottom: y + height }
  for (let element: Element | null = host; element && element !== document.body && element !== document.documentElement; element = element.parentElement) {
    if (clips(getComputedStyle(element))) box = intersect(box, paddingBox(element))
  }
  return { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top }
}

export function drawnRegion(frame: Frame, [side, top, bottom]: readonly [number, number, number], within: Region): Region | null {
  const { lines, sprites } = frame
  let left = Infinity
  let upper = Infinity
  let right = -Infinity
  let lower = -Infinity
  for (let o = 0; o < frame.lineCount * LINE_FLOATS; o += LINE_FLOATS) {
    left = Math.min(left, lines[o]! - side)
    upper = Math.min(upper, lines[o + 1]! - top)
    right = Math.max(right, lines[o]! + lines[o + 2]! + side)
    lower = Math.max(lower, lines[o + 1]! + lines[o + 3]! + bottom)
  }
  for (let o = 0; o < frame.spriteCount * SPRITE_FLOATS; o += SPRITE_FLOATS) {
    const reach = sprites[o + 2]! * Math.SQRT1_2
    left = Math.min(left, sprites[o]! - reach)
    upper = Math.min(upper, sprites[o + 1]! - reach)
    right = Math.max(right, sprites[o]! + reach)
    lower = Math.max(lower, sprites[o + 1]! + reach)
  }
  left = Math.max(Math.floor(left / GRID) * GRID, within.x)
  upper = Math.max(Math.floor(upper / GRID) * GRID, within.y)
  right = Math.min(Math.ceil(right / GRID) * GRID, within.x + within.width)
  lower = Math.min(Math.ceil(lower / GRID) * GRID, within.y + within.height)
  return right > left && lower > upper ? { x: left, y: upper, width: right - left, height: lower - upper } : null
}

export function arrange(sizes: readonly Size[]): { slots: Region[]; width: number; height: number } {
  const slots: Region[] = []
  let x = 0
  let y = 0
  let row = 0
  let width = 0
  for (const size of sizes) {
    if (x > 0 && x + size.width > ATLAS_WIDTH) {
      x = 0
      y += row
      row = 0
    }
    slots.push({ x, y, width: size.width, height: size.height })
    x += size.width
    row = Math.max(row, size.height)
    width = Math.max(width, x)
  }
  return { slots, width, height: y + row }
}
