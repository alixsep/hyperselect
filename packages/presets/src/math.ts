export const random: () => number = Math.random

export const between = (min: number, max: number): number => min + Math.random() * (max - min)

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x)

export const smooth = (x: number): number => x * x * (3 - 2 * x)

export const easeOutCubic = (x: number): number => 1 - (1 - x) ** 3

export const easeOutBack = (x: number): number => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2

export const envelope = (life: number, fadeIn: number, fadeOutFrom: number): number =>
  smooth(clamp01(life / fadeIn)) * (1 - smooth(clamp01((life - fadeOutFrom) / (1 - fadeOutFrom))))

const MULTIPLIER = 1664525

const lattice = (v: number): number => (Math.imul(Math.round(v * 1024), MULTIPLIER) + 1013904223) >>> 0

export function shaderHash(x: number, y: number): number {
  let a = lattice(x)
  let b = lattice(y)
  for (let round = 0; round < 2; round++) {
    a = (a + Math.imul(b, MULTIPLIER)) >>> 0
    b = (b + Math.imul(a, MULTIPLIER)) >>> 0
    a = (a ^ (a >>> 16)) >>> 0
    b = (b ^ (b >>> 16)) >>> 0
  }
  return (a >>> 8) / 16777216
}
