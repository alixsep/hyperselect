import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const gradient: Preset = {
  name: 'gradient',
  pad: [12, 4, 6],
  tint: [0.62, 0.4, 1.0],
  selection: { dark: 'color:#ffffff', light: 'color:#2a1240' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float body = solid(sdRBox(local, hs, 4.0));
  if (body <= 0.0) return vec4(0.0);
  float x = local.x + hs.x;
  float head = easeOut(age * 1.8) * (2.0 * hs.x + 60.0);
  float wipe = smoothstep(head, head - 60.0, x);
  float u = clamp(x / (2.0 * hs.x) + 0.12 * sin(t * 0.4 + seed * 6.0), 0.0, 1.0);
  vec3 a0 = mix(vec3(0.42, 0.28, 0.92), vec3(0.74, 0.66, 1.0), uLight);
  vec3 a1 = mix(vec3(0.84, 0.28, 0.66), vec3(0.98, 0.68, 0.86), uLight);
  vec3 a2 = mix(vec3(0.98, 0.56, 0.36), vec3(1.0, 0.8, 0.64), uLight);
  vec3 col = mix(mix(a0, a1, smoothstep(0.0, 0.55, u)), a2, smoothstep(0.5, 1.0, u));
  col *= 1.0 - 0.08 * local.y / hs.y;
  float a = mix(0.8, 0.85, uLight) * body * wipe * presence(fade);
  return vec4(col * a, a);
}`,
}
