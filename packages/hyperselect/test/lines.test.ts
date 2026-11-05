import { describe, expect, it } from 'vitest'
import { Lines } from '../src/lines'

const page = {} as HTMLElement
const row = (y: number, x = 0, w = 100) => ({ x, y, w, h: 20, backdrop: page })

describe('Lines', () => {
  it('keeps a line alive while it tracks the selection', () => {
    const lines = new Lines()
    lines.sync([row(0)])
    const [line] = lines.all
    lines.step(0.5)
    lines.sync([{ ...row(1), w: 140 }])
    expect(lines.all).toEqual([line])
    expect(line).toMatchObject({ y: 1, w: 140, dead: false, age: 0.5 })
  })

  it('fades out and removes lines that leave the selection', () => {
    const lines = new Lines()
    lines.sync([row(0)])
    lines.step(1)
    lines.sync([])
    expect(lines.all[0]!.dead).toBe(true)
    for (let i = 0; i < 60; i++) lines.step(1 / 60)
    expect(lines.all).toHaveLength(0)
  })

  it('revives a fading line when it is selected again', () => {
    const lines = new Lines()
    lines.sync([row(0)])
    const [line] = lines.all
    lines.step(0.5)
    lines.sync([])
    lines.step(0.05)
    lines.sync([row(0)])
    expect(lines.all).toEqual([line])
    expect(line!.dead).toBe(false)
  })

  it('knows which edges are shared with a neighboring line', () => {
    const lines = new Lines()
    lines.sync([row(0), row(20, 0, 60)])
    const [top, bottom] = lines.all
    expect(lines.edgeCovered(top!, true, 30)).toBe(false)
    expect(lines.edgeCovered(top!, false, 30)).toBe(true)
    expect(lines.edgeCovered(top!, false, 90)).toBe(false)
    expect(lines.edgeCovered(bottom!, true, 30)).toBe(true)
  })

  it('keeps lines ordered top to bottom so they layer consistently', () => {
    const lines = new Lines()
    lines.sync([row(40)])
    lines.sync([row(40), row(0), row(20)])
    expect(lines.all.map((l) => l.y)).toEqual([0, 20, 40])
  })

  it('only relates lines that share a backdrop', () => {
    const card = {} as HTMLElement
    const lines = new Lines()
    lines.sync([row(0), { ...row(20), backdrop: card }])
    const [top, bottom] = lines.all
    expect(lines.edgeCovered(top!, false, 30)).toBe(false)
    lines.step(1 / 60)
    expect(bottom!.cover).toBe(0)
    lines.sync([row(0), { ...row(0), backdrop: card }])
    expect(lines.all).toHaveLength(3)
  })

  it('knows on the first frame whether a line is covered from above', () => {
    const lines = new Lines()
    lines.sync([row(0), row(20)])
    lines.step(1 / 60)
    expect(lines.all.map((l) => l.cover)).toEqual([0, 1])
  })

  it('packs lines for the GPU', () => {
    const lines = new Lines()
    lines.sync([row(10, 5, 50)])
    const out = new Float32Array(16)
    expect(lines.pack(out, page)).toBe(1)
    expect(lines.pack(out, {} as HTMLElement)).toBe(0)
    expect([...out.subarray(0, 4)]).toEqual([5, 10, 50, 20])
  })

  it('measures the padded area it shades inside the view', () => {
    const lines = new Lines()
    lines.sync([row(0), row(30)])
    expect(lines.area([10, 5, 5], { x: -100, y: -100, width: 1000, height: 1000 }, page)).toBe(2 * 120 * 30)
    expect(lines.area([10, 5, 5], { x: 0, y: 0, width: 1000, height: 40 }, page)).toBe(110 * 25 + 110 * 15)
    expect(lines.area([10, 5, 5], { x: -100, y: -100, width: 1000, height: 1000 }, {} as HTMLElement)).toBe(0)
  })
})
