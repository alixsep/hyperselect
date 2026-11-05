import { Engine, type HyperSelect, type Options } from './engine'

const inert: HyperSelect = { setPreset() {}, setTheme() {}, destroy() {} }

export function createHyperSelect(options: Options): HyperSelect {
  return Engine.create(options) ?? inert
}

export { highlight } from './highlight'
export type { HyperSelect, Options } from './engine'
export type { Highlight, HighlightOptions } from './highlight'
export type { Line } from './lines'
export type { Padding } from './selection'
export type { Behavior, LineLookup, Particles, Preset, Sim, Theme } from './types'
