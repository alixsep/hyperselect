import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const pulse: Preset = {
  name: 'pulse',
  pad: [18, 16, 18],
  tint: [0.92, 0.32, 0.85],
  selection: { dark: 'color:#fff0fd', light: 'color:#3d0838' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(3.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (d > 9.0) return vec4(0.0);
  float phase = fract(age / 2.2);
  float spread = 1.0 - phase;
  float wave = stroke(d - 1.0 - easeOut(phase) * 7.0, 0.6) * spread * spread * smoothstep(hs.y + 3.0, hs.y, abs(local.y));
  float beat = spread * spread * spread;
  float settle = easeOut(age * 2.5);
  vec3 ink = mix(vec3(0.95, 0.38, 0.88), vec3(0.78, 0.18, 0.7), uLight);
  vec4 c = vec4(ink, 1.0) * solid(d) * settle * (mix(0.16, 0.13, uLight) + 0.12 * beat);
  c = over(c, ink, stroke(d, 0.5) * settle * mix(0.35, 0.3, uLight));
  c = over(c, ink, wave * mix(0.85, 0.6, uLight));
  return c * presence(fade);
}`,
}
