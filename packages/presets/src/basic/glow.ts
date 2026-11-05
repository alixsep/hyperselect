import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const glow: Preset = {
  name: 'glow',
  pad: [28, 16, 18],
  tint: [1.0, 0.62, 0.25],
  selection: { dark: 'color:#fff8ee', light: 'color:#3a1e00' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float bloom = easeOut(age * 2.2);
  vec2 hs = (halfSize + vec2(4.0, 1.0)) * vec2(mix(0.8, 1.0, bloom), mix(0.5, 1.0, bloom));
  float d = sdRBox(local, hs, hs.y);
  float haze = smoothstep(12.0, -6.0, d);
  if (haze <= 0.0) return vec4(0.0);
  haze *= haze * (3.0 - 2.0 * haze);
  float drift = noise(vec2(world.x * 0.012 - t * 0.2, seed * 9.0));
  float breath = 0.92 + 0.08 * sin(t * 1.3 + seed * 6.0);
  float core = smoothstep(2.0, -10.0, d);
  float k = haze * breath * (0.92 + 0.12 * drift) * bloom * presence(fade);
  vec3 warm = mix(vec3(1.0, 0.5, 0.14), vec3(1.0, 0.72, 0.42), uLight);
  vec3 hot = mix(vec3(1.0, 0.76, 0.42), vec3(1.0, 0.8, 0.56), uLight);
  vec3 col = mix(warm, hot, core * 0.7);
  return vec4(col * k * mix(0.62, 0.55, uLight), k * mix(0.24, 0.55, uLight));
}`,
}
