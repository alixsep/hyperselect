import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const frame: Preset = {
  name: 'frame',
  pad: [16, 12, 12],
  tint: [0.8, 0.6, 0.36],
  selection: { dark: 'color:#fbf3e6', light: 'color:#2e1f0c' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  vec2 q = abs(local);
  float grow = easeOut(age * 2.0) * (1.0 - leaving(age, fade));
  vec2 reach = hs * grow + 4.0 * smoothstep(0.6, 1.0, grow);
  float rows = sdBox(vec2(q.x, q.y - hs.y), vec2(reach.x, 0.5)) + cover * step(local.y, 0.0) * 4.0;
  float cols = sdBox(vec2(q.x - hs.x, q.y), vec2(0.5, reach.y));
  float lines = solid(min(rows, cols));
  float fill = solid(sdBox(local, hs)) * grow;
  vec3 ink = mix(vec3(0.86, 0.68, 0.44), vec3(0.56, 0.38, 0.16), uLight);
  vec4 c = vec4(ink, 1.0) * fill * mix(0.07, 0.08, uLight);
  c = over(c, ink, lines * mix(0.85, 0.8, uLight));
  return c * presence(fade);
}`,
}
