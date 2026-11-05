import { expect, it } from 'vitest'
import { categories } from '../src'

const presets = Object.values(categories).flatMap((category) => Object.entries(category))

it('holds twenty presets in each category', () => {
  for (const category of Object.values(categories)) expect(Object.keys(category)).toHaveLength(20)
})

it('names every preset after its export, once', () => {
  for (const [key, preset] of presets) expect(preset.name).toBe(key)
  expect(new Set(presets.map(([key]) => key)).size).toBe(presets.length)
})
