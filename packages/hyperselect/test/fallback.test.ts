// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { createHyperSelect, type Preset } from '../src'

const preset = (name: string): Preset => ({
  name,
  pad: [0, 0, 0],
  tint: [1, 1, 1],
  selection: { dark: '', light: '' },
  surface: 'vec4 surface(float t, float age, float fade, float seed, float cover) { return vec4(0.0); }',
})

it('leaves the page untouched when WebGL2 is unavailable', () => {
  const selection = createHyperSelect({ preset: preset('first') })
  selection.setPreset(preset('second'))
  selection.setTheme('light')
  selection.destroy()
  expect(document.querySelector('canvas, style')).toBeNull()
  expect(document.documentElement.hasAttribute('data-hyperselect')).toBe(false)
})
