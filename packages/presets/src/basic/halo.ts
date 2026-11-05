import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const halo: Preset = {
  name: 'halo',
  pad: [20, 12, 14],
  tint: [1.0, 0.8, 0.4],
  selection: { dark: 'color:#fff8e6', light: 'color:#3a2a00' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float bloom = easeOut(age * 2.0);
  vec2 hs = halfSize + vec2(6.0, 3.0) * bloom + vec2(2.0, 0.0);
  float d = sdRBox(local, hs, hs.y);
  if (d > 9.0) return vec4(0.0);
  float ang = atan(local.y / hs.y, local.x / hs.x);
  float glint = 0.5 + 0.5 * cos(ang - t * 0.9 - seed * 6.0);
  glint *= glint * glint * glint;
  float ring = stroke(d, 0.6);
  float aura = exp(-abs(d) / mix(4.0, 3.0, uLight)) * mix(0.45, 0.35, uLight);
  float inner = smoothstep(0.0, -10.0, d) * 0.06;
  float k = (ring * (0.75 + 0.25 * glint) + aura * (0.7 + 0.3 * glint) + inner) * bloom * presence(fade);
  vec3 gold = mix(vec3(1.0, 0.78, 0.38), vec3(0.95, 0.68, 0.18), uLight);
  vec3 col = mix(gold, vec3(1.0, 0.95, 0.82), ring * glint * (1.0 - uLight));
  return vec4(col * k, k * mix(0.6, 1.0, uLight));
}`,
}
