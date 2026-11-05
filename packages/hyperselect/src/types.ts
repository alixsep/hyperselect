import type { Line, Lines } from './lines'
import type { Pool } from './pool'

export type Theme = 'light' | 'dark'

export type Particles = Pick<
  Pool,
  'x' | 'y' | 'vx' | 'vy' | 'rot' | 'spin' | 'size' | 'base' | 'age' | 'life' | 'alpha' | 'seed' | 'kind' | 'params' | 'line' | 'spawn' | 'move'
>

export type LineLookup = Pick<Lines, 'get' | 'edgeCovered'>

export interface Sim {
  readonly pool: Particles
  readonly lines: LineLookup
  readonly dt: number
  readonly time: number
}

export interface Behavior {
  emit(line: Line, sim: Sim): void
  update(particle: number, sim: Sim): boolean
}

export interface Preset {
  readonly name: string
  readonly pad: readonly [sides: number, top: number, bottom: number]
  readonly tint: readonly [r: number, g: number, b: number]
  readonly selection: { readonly dark: string; readonly light: string }
  readonly surface: string
  readonly sprite?: string
  readonly behavior?: () => Behavior
}
