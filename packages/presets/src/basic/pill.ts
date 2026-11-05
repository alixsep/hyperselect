import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const pill: Preset = {
  name: 'pill',
  pad: [12, 6, 6],
  tint: [0.2, 0.75, 0.46],
  selection: { dark: 'color:#ffffff', light: 'color:#053d22' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 full = halfSize + vec2(6.0, 1.0);
  float stay = 1.0 - leaving(age, fade);
  float grow = easeOut(age * 3.2) * stay;
  float pop = easeBack(age * 3.2) * stay;
  vec2 hs = vec2(max(full.x * grow, full.y), full.y * mix(0.5, 1.0, pop));
  float d = sdRBox(local, hs, hs.y);
  float body = solid(d);
  if (body <= 0.0) return vec4(0.0);
  vec3 face = mix(vec3(0.1, 0.58, 0.38), vec3(0.6, 0.9, 0.74), uLight);
  float gloss = smoothstep(0.0, -hs.y, local.y) * smoothstep(-0.5, -4.0, d);
  vec3 col = face * (1.0 - 0.1 * smoothstep(-hs.y, hs.y, local.y)) + gloss * mix(0.08, 0.06, uLight);
  col = mix(col, face * 0.78, stroke(d + 0.6, 0.5) * mix(0.6, 0.4, uLight));
  float a = mix(0.92, 0.9, uLight) * body * presence(fade);
  return vec4(col * a, a);
}`,
}
