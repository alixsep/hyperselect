import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const squiggle: Preset = {
  name: 'squiggle',
  pad: [8, 4, 14],
  tint: [1.0, 0.38, 0.33],
  selection: { dark: 'color:#fff1ef', light: 'color:#4a0d08' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(2.0, 0.0);
  float baseline = hs.y + 3.5;
  if (abs(local.y - baseline) > 4.0) return vec4(0.0);
  float k = 2.0 * PI / 9.0;
  float amp = 1.7;
  float phase = local.x * k - t * 1.6 + seed * 6.0;
  float wave = baseline + amp * sin(phase);
  float slope = amp * k * cos(phase);
  float d = abs(local.y - wave) / sqrt(1.0 + slope * slope) - 0.8;
  float span = 2.0 * hs.x;
  float head = -hs.x + easeOut(age * 1.8) * span;
  float tail = -hs.x + leaving(age, fade) * span;
  float drawn = smoothstep(head + 1.0, head - 1.0, local.x) * smoothstep(tail - 1.0, tail + 1.0, local.x);
  vec3 ink = mix(vec3(1.0, 0.45, 0.4), vec3(0.88, 0.24, 0.2), uLight);
  float a = solid(d) * drawn * presence(fade);
  return vec4(ink * a, a);
}`,
}
