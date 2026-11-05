import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const highlighter: Preset = {
  name: 'highlighter',
  pad: [12, 4, 6],
  tint: [0.98, 0.88, 0.2],
  selection: { dark: 'color:#1f1a00', light: 'color:#2a2400' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(3.0, 1.0);
  float tilt = (hash(vec2(seed, 3.0)) - 0.5) * 0.008;
  vec2 p = vec2(local.x, local.y + local.x * tilt);
  float start = -hs.x - 2.0, span = 2.0 * hs.x + 4.0;
  float head = start + easeOut(age * 2.4) * span;
  float tail = start + leaving(age, fade) * (span + 12.0);
  float chisel = p.y * 0.3;
  float dY = abs(p.y) - hs.y;
  float d = max(dY, max(tail + chisel - p.x, p.x - head - chisel));
  float body = solid(d);
  if (body <= 0.0) return vec4(0.0);
  float pooled = smoothstep(3.0, 0.4, -dY);
  float streak = noise(vec2(world.x * 0.015, p.y * 0.45 + seed * 17.0));
  vec3 ink = mix(vec3(0.94, 0.85, 0.2), vec3(1.0, 0.93, 0.38), uLight);
  vec3 rim = mix(vec3(0.86, 0.72, 0.06), vec3(0.97, 0.83, 0.2), uLight);
  vec3 col = mix(ink, rim, pooled * 0.7);
  float a = mix(0.84, 0.72, uLight) * (0.9 + 0.08 * streak + 0.08 * pooled);
  a *= body * presence(fade);
  return vec4(col * a, a);
}`,
}
