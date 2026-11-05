import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const dots: Preset = {
  name: 'dots',
  pad: [10, 4, 6],
  tint: [0.25, 0.72, 1.0],
  selection: { dark: 'color:#effaff', light: 'color:#06283d' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  if (sdBox(local, hs) > 1.0) return vec4(0.0);
  float gap = 7.0;
  vec2 cell = (floor(world / gap) + 0.5) * gap;
  vec2 center = local + cell - world;
  float inside = step(sdBox(center, hs - 1.0), 0.0);
  float order = (center.x + hs.x) / (2.0 * hs.x);
  float pop = easeBack(age * 3.0 - order * 1.1);
  float wave = 0.85 + 0.15 * sin(t * 1.5 - cell.x * 0.05 + cell.y * 0.2);
  float r = 1.05 * pop * wave * mix(1.0, 0.0, leaving(age, fade));
  float spot = solid(length(world - cell) - r) * inside;
  vec3 ink = mix(vec3(0.36, 0.78, 1.0), vec3(0.12, 0.5, 0.82), uLight);
  vec4 c = vec4(ink, 1.0) * solid(sdRBox(local, hs, 2.0)) * easeOut(age * 2.0) * mix(0.1, 0.07, uLight);
  c = over(c, ink, spot * mix(0.7, 0.75, uLight));
  return c * presence(fade);
}`,
}
