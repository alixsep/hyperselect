// @vitest-environment node
import { expect, it } from 'vitest'
import { createHyperSelect, highlight, type Preset } from '../src'

const preset: Preset = {
  name: 'server',
  pad: [0, 0, 0],
  tint: [1, 1, 1],
  selection: { dark: '', light: '' },
  surface: 'vec4 surface(float t, float age, float fade, float seed, float cover) { return vec4(0.0); }',
}

it('imports and runs without a DOM, as during server rendering', () => {
  const selection = createHyperSelect({ preset })
  const badge = highlight({} as HTMLElement, { preset })
  for (const instance of [selection, badge]) {
    instance.setPreset(preset)
    instance.setTheme('light')
    instance.destroy()
  }
  expect(typeof document).toBe('undefined')
})
