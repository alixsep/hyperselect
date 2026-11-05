import { describe, expect, it } from 'vitest'
import { LINE_FLOATS } from '../src/lines'
import { SPRITE_FLOATS } from '../src/pool'
import { arrange, drawnRegion } from '../src/region'
import type { Frame } from '../src/renderer'

const view = { x: 0, y: 0, width: 1000, height: 1000 }

function frame(lines: number[][], sprites: number[][] = []): Frame {
  const packed = { lines: new Float32Array(8 * LINE_FLOATS), sprites: new Float32Array(8 * SPRITE_FLOATS) }
  lines.forEach((line, i) => packed.lines.set(line, i * LINE_FLOATS))
  sprites.forEach((sprite, i) => packed.sprites.set(sprite, i * SPRITE_FLOATS))
  return { time: 0, fade: 1, light: 0, x: 0, y: 0, dpr: 1, ...packed, lineCount: lines.length, spriteCount: sprites.length }
}

describe('drawnRegion', () => {
  it('covers each line and its padding, snapped outward to the grid', () => {
    expect(drawnRegion(frame([[100, 200, 300, 20]]), [10, 40, 8], view)).toEqual({ x: 64, y: 160, width: 352, height: 96 })
  })

  it('reaches the corners of rotated particles', () => {
    const region = drawnRegion(frame([[100, 200, 50, 20]], [[500, 50, 40]]), [0, 0, 0], view)!
    expect(region.x + region.width).toBeGreaterThanOrEqual(500 + 40 * Math.SQRT1_2)
    expect(region.y).toBeLessThanOrEqual(50 - 40 * Math.SQRT1_2)
  })

  it('stays inside the view and vanishes when everything is outside it', () => {
    expect(drawnRegion(frame([[-50, 900, 2000, 300]]), [0, 0, 0], view)).toEqual({ x: 0, y: 896, width: 1000, height: 104 })
    expect(drawnRegion(frame([[100, 2000, 50, 20]]), [0, 0, 0], view)).toBeNull()
  })
})

describe('arrange', () => {
  it('packs slots in rows and wraps past the atlas width', () => {
    const { slots, width, height } = arrange([
      { width: 1500, height: 100 },
      { width: 400, height: 60 },
      { width: 300, height: 80 },
    ])
    expect(slots).toEqual([
      { x: 0, y: 0, width: 1500, height: 100 },
      { x: 1500, y: 0, width: 400, height: 60 },
      { x: 0, y: 100, width: 300, height: 80 },
    ])
    expect({ width, height }).toEqual({ width: 1900, height: 180 })
  })
})
