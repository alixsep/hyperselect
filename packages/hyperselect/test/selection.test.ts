import { describe, expect, it } from 'vitest'
import { mergeLines, padLines, paints } from '../src/selection'

const page = {} as HTMLElement

describe('mergeLines', () => {
  it('joins fragments that share a line box', () => {
    const lines = mergeLines([
      { x: 0, y: 0, w: 50, h: 20, backdrop: page },
      { x: 60, y: 2, w: 40, h: 16, backdrop: page },
    ])
    expect(lines).toEqual([{ x: 0, y: 0, w: 100, h: 20, backdrop: page }])
  })

  it('keeps separate lines apart and sorts them top to bottom', () => {
    const lines = mergeLines([
      { x: 0, y: 30, w: 50, h: 20, backdrop: page },
      { x: 0, y: 0, w: 80, h: 20, backdrop: page },
    ])
    expect(lines.map((l) => l.y)).toEqual([0, 30])
  })

  it('keeps distant fragments on the same row apart', () => {
    const lines = mergeLines([
      { x: 0, y: 0, w: 50, h: 20, backdrop: page },
      { x: 200, y: 0, w: 50, h: 20, backdrop: page },
    ])
    expect(lines).toHaveLength(2)
  })

  it('keeps a drop cap apart from the lines beside it', () => {
    const lines = mergeLines([
      { x: 0, y: 0, w: 40, h: 83, backdrop: page },
      { x: 48, y: 10, w: 300, h: 34, backdrop: page },
      { x: 48, y: 44, w: 300, h: 34, backdrop: page },
    ])
    expect(lines).toHaveLength(3)
  })

  it('keeps fragments on different backdrops apart', () => {
    const lines = mergeLines([
      { x: 0, y: 0, w: 50, h: 20, backdrop: page },
      { x: 55, y: 0, w: 50, h: 20, backdrop: {} as HTMLElement },
    ])
    expect(lines).toHaveLength(2)
  })

  it('does not mutate its input', () => {
    const input = [
      { x: 0, y: 0, w: 50, h: 20, backdrop: page },
      { x: 55, y: 0, w: 50, h: 20, backdrop: page },
    ]
    mergeLines(input)
    expect(input[0]).toEqual({ x: 0, y: 0, w: 50, h: 20, backdrop: page })
  })
})

describe('padLines', () => {
  it('grows each side of a line by its own amount', () => {
    expect(padLines([{ x: 10, y: 20, w: 100, h: 20, backdrop: page }], { top: 4, right: 2, bottom: 1, left: 6 })).toEqual([
      { x: 4, y: 16, w: 108, h: 25, backdrop: page },
    ])
  })

  it('lets stacked lines meet halfway instead of overlapping', () => {
    const lines = padLines(
      [
        { x: 0, y: 0, w: 100, h: 20, backdrop: page },
        { x: 0, y: 24, w: 100, h: 20, backdrop: page },
      ],
      { top: 8, right: 0, bottom: 8, left: 0 },
    )
    expect(lines.map((l) => [l.y, l.h])).toEqual([
      [-8, 30],
      [22, 30],
    ])
  })

  it('never collapses a line below a pixel', () => {
    expect(padLines([{ x: 10, y: 20, w: 4, h: 20, backdrop: page }], { top: 0, right: -10, bottom: 0, left: -10 })[0]).toMatchObject({ x: 11.5, w: 1 })
  })
})

describe('paints', () => {
  it('sees opaque colors with a zero channel', () => {
    expect(paints({ backgroundColor: 'rgb(255, 102, 0)', backgroundImage: 'none' })).toBe(true)
    expect(paints({ backgroundColor: 'rgba(0, 0, 0, 0.5)', backgroundImage: 'none' })).toBe(true)
  })

  it('ignores fully transparent colors', () => {
    expect(paints({ backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none' })).toBe(false)
    expect(paints({ backgroundColor: 'oklch(0.5 0.1 200 / 0)', backgroundImage: 'none' })).toBe(false)
  })

  it('counts a background image', () => {
    expect(paints({ backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'linear-gradient(red, blue)' })).toBe(true)
  })
})
