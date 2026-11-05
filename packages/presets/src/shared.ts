import type { Line } from 'hyperselect'
import { shaderHash } from './math'

export function accumulator(cap: number = Infinity): (line: Line, amount: number) => number {
  const owed = new WeakMap<Line, number>()
  return (line, amount) => {
    const total = Math.min((owed.get(line) ?? 0) + amount, cap)
    const whole = Math.floor(total)
    owed.set(line, total - whole)
    return whole
  }
}

export function burning(line: Line, speed: number): [from: number, to: number] {
  const ignition = line.x + line.w / 2 + (shaderHash(line.seed, 3) - 0.5) * (line.w / 2 + 5) * 1.2
  const reach = line.age * speed - 20
  return [Math.max(line.x, ignition - reach), Math.min(line.x + line.w, ignition + reach)]
}
