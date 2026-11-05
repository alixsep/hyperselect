import { describe, expect, it } from 'vitest'
import { Governor } from '../src/governor'

const run = (governor: Governor, ms: number, seconds: number): void => {
  for (let elapsed = 0; elapsed < seconds * 1000; elapsed += ms) governor.sample(ms)
}

describe('Governor', () => {
  it('keeps full resolution at a steady frame rate', () => {
    const governor = new Governor()
    run(governor, 16.7, 10)
    expect(governor.scale).toBe(1)
  })

  it('lowers resolution while frames are slow, down to a floor', () => {
    const governor = new Governor()
    run(governor, 33, 0.9)
    expect(governor.scale).toBe(0.75)
    run(governor, 33, 5)
    expect(governor.scale).toBe(0.75)
  })

  it('restores resolution once frames are fast again', () => {
    const governor = new Governor()
    run(governor, 33, 2)
    run(governor, 16.7, 4.5)
    expect(governor.scale).toBe(1)
  })

  it('waits longer before retrying a resolution that was too slow', () => {
    const governor = new Governor()
    run(governor, 33, 0.9)
    run(governor, 16.7, 4)
    expect(governor.scale).toBe(1)
    run(governor, 33, 0.5)
    expect(governor.scale).toBe(0.75)
    run(governor, 16.7, 4)
    expect(governor.scale).toBe(0.75)
    run(governor, 16.7, 3)
    expect(governor.scale).toBe(1)
  })

  it('ignores gaps from an idle or hidden page', () => {
    const governor = new Governor()
    governor.sample(5000)
    run(governor, 16.7, 2)
    expect(governor.scale).toBe(1)
  })
})
