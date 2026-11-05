import { describe, expect, it } from 'vitest'
import { Pool, SPRITE_FLOATS } from '../src/pool'

describe('Pool', () => {
  it('spawns until full and reuses killed slots', () => {
    const pool = new Pool(2)
    const a = pool.spawn(1)
    const b = pool.spawn(1)
    expect(pool.spawn(1)).toBe(-1)
    expect(pool.full).toBe(true)
    pool.kill(a)
    expect(pool.spawn(2)).toBe(a)
    expect(pool.line[a]).toBe(2)
    expect(b).not.toBe(a)
  })

  it('resets particle state on spawn', () => {
    const pool = new Pool(1)
    const i = pool.spawn(1)
    pool.x[i] = 5
    pool.kind[i] = 3
    pool.params[i * 4] = 9
    pool.kill(i)
    const j = pool.spawn(1)
    expect([pool.x[j], pool.kind[j], pool.params[j * 4]]).toEqual([0, 0, 1])
  })

  it('packs only live particles, densely', () => {
    const pool = new Pool(4)
    const ids = [pool.spawn(1), pool.spawn(1), pool.spawn(1)]
    ids.forEach((i, n) => (pool.x[i] = n + 1))
    pool.life.fill(1)
    pool.kill(ids[1]!)
    const out = new Float32Array(4 * SPRITE_FLOATS)
    expect(pool.pack(out)).toBe(2)
    expect([out[0], out[SPRITE_FLOATS]]).toEqual([1, 3])
  })

  it('visits every live particle once', () => {
    const pool = new Pool(8)
    for (let i = 0; i < 5; i++) pool.spawn(1)
    pool.kill(2)
    const seen: number[] = []
    pool.forEach((i) => seen.push(i))
    expect(seen).toEqual([0, 1, 3, 4])
  })
})
