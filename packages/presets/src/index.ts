import type { Preset } from 'hyperselect'
import * as art from './art'
import * as basic from './basic'
import * as digital from './digital'
import * as elements from './elements'
import * as holidays from './holidays'
import * as light from './light'
import * as materials from './materials'
import * as nature from './nature'
import * as playful from './playful'
import * as space from './space'
import * as weather from './weather'

export * from './art'
export * from './basic'
export * from './digital'
export * from './elements'
export * from './holidays'
export * from './light'
export * from './materials'
export * from './nature'
export * from './playful'
export * from './space'
export * from './weather'

export type Category = 'basic' | 'nature' | 'elements' | 'materials' | 'light' | 'space' | 'weather' | 'art' | 'digital' | 'playful' | 'holidays'

export const categories: Readonly<Record<Category, Readonly<Record<string, Preset>>>> = {
  basic,
  nature,
  elements,
  materials,
  light,
  space,
  weather,
  art,
  digital,
  playful,
  holidays,
}
