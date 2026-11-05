import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const brackets: Preset = {
  name: 'brackets',
  pad: [12, 6, 8],
  tint: [0.62, 0.88, 0.22],
  selection: { dark: 'color:#f6ffe8', light: 'color:#1d2e00' },
  surface: /* glsl */ `${motion}
float bracket(vec2 p, vec2 hs) {
  float bar = sdBox(p, vec2(0.75, hs.y));
  float serif = sdBox(vec2(p.x - 3.0, abs(p.y) - hs.y + 0.75), vec2(3.75, 0.75));
  return min(bar, serif);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float reach = easeOut(age * 2.2) * (1.0 - leaving(age, fade));
  float right = mix(-hs.x + 10.0, hs.x, reach);
  float d = min(bracket(local + vec2(hs.x, 0.0), hs), bracket(vec2(right - local.x, local.y), hs));
  float fill = solid(max(sdBox(local, hs), local.x - right)) * reach;
  vec3 ink = mix(vec3(0.68, 0.94, 0.32), vec3(0.36, 0.6, 0.04), uLight);
  vec4 c = vec4(ink, 1.0) * fill * mix(0.08, 0.1, uLight);
  c = over(c, ink, solid(d));
  return c * presence(fade);
}`,
}
