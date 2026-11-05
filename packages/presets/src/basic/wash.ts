import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const wash: Preset = {
  name: 'wash',
  pad: [16, 6, 8],
  tint: [0.42, 0.82, 0.76],
  selection: { dark: 'color:#effffb', light: 'color:#0b3a33' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float spread = easeOut(age * 1.5);
  float front = -hs.x - 30.0 + spread * (2.0 * hs.x + 60.0);
  float d = max(sdRBox(local, hs, hs.y * 0.6), local.x - front);
  float soft = 4.0 + 20.0 * smoothstep(front - 80.0, front, local.x) * (1.0 - spread);
  float veil = smoothstep(soft * 0.5, -soft * 0.5, d);
  if (veil <= 0.0) return vec4(0.0);
  float tone = noise(vec2(world.x * 0.01 - t * 0.12, world.y * 0.04 + seed * 7.0));
  float sink = smoothstep(-hs.y, hs.y, local.y);
  vec3 col = mix(vec3(0.3, 0.78, 0.7), vec3(0.6, 0.86, 0.8), uLight);
  col *= 0.92 + 0.12 * tone;
  float a = mix(0.46, 0.5, uLight) * (0.85 + 0.15 * sink) * (0.88 + 0.12 * tone) * veil * presence(fade);
  return vec4(col * a, a);
}`,
}
