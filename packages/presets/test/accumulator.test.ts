import { describe, expect, it } from 'vitest'
import type { Line } from 'hyperselect'
import { accumulator } from '../src/shared'

const line = () => ({ id: 1 }) as Line

describe('accumulator', () => {
  it('carries fractional amounts between frames', () => {
    const emit = accumulator()
    const l = line()
    expect([0.4, 0.4, 0.4].map((a) => emit(l, a))).toEqual([0, 0, 1])
  })

  it('tracks each line separately', () => {
    const emit = accumulator()
    const [a, b] = [line(), line()]
    emit(a, 0.9)
    expect(emit(b, 0.2)).toBe(0)
    expect(emit(a, 0.2)).toBe(1)
  })

  it('caps the backlog', () => {
    const emit = accumulator(3)
    expect(emit(line(), 100)).toBe(3)
  })
})
