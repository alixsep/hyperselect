import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const block: Preset = {
  name: 'block',
  pad: [8, 6, 6],
  tint: [1.0, 0.45, 0.1],
  selection: { dark: 'color:#1a0a00', light: 'color:#2a1000' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float open = easeBack(age * 4.5) * (1.0 - leaving(age, fade));
  vec2 hs = (halfSize + vec2(2.0, 1.0)) * vec2(1.0, open);
  float d = sdBox(local, hs);
  float body = solid(d);
  if (body <= 0.0) return vec4(0.0);
  vec3 face = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.64, 0.36), uLight);
  vec3 base = face * mix(0.78, 0.86, uLight);
  vec3 col = mix(face, base, smoothstep(hs.y - 2.0, hs.y - 1.0, local.y));
  float a = body * presence(fade);
  return vec4(col * a, a);
}`,
}
