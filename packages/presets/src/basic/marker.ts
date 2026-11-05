import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const marker: Preset = {
  name: 'marker',
  pad: [14, 6, 10],
  tint: [1.0, 0.31, 0.55],
  selection: { dark: 'color:#fff4f8', light: 'color:#3b0718' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 0.0);
  float tilt = (hash(vec2(seed, 5.0)) - 0.5) * 0.02;
  float bow = (hash(vec2(seed, 6.0)) - 0.5) * 3.0;
  float u = local.x / hs.x;
  float y = local.y + local.x * tilt + bow * (1.0 - u * u);
  float top = -hs.y * 0.82 + (fbm3(vec2(world.x * 0.035, seed * 11.0)) - 0.5) * 3.2;
  float bottom = hs.y + 1.5 + (fbm3(vec2(world.x * 0.035, seed * 11.0 + 4.0)) - 0.5) * 3.2;
  float girth = (bottom - top) * 0.5;
  float dY = abs(y - (top + bottom) * 0.5) - girth;
  float span = 2.0 * hs.x;
  float head = -hs.x - 8.0 + easeOut(age * 2.0) * (span + 8.0);
  float tail = -hs.x + leaving(age, fade) * (span + 16.0);
  float dX = max(local.x - head, tail - local.x);
  float r = girth * 0.8;
  vec2 q = vec2(dX, dY) + r;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float body = solid(d);
  if (body <= 0.0) return vec4(0.0);
  float streak = noise(vec2(world.x * 0.012, y * 0.7 + seed * 3.0));
  float dry = smoothstep(hs.x - 46.0, hs.x + 4.0, local.x) * smoothstep(0.45, 0.75, streak);
  float press = smoothstep(-hs.x + 16.0, -hs.x, local.x);
  vec3 ink = mix(vec3(0.84, 0.19, 0.45), vec3(1.0, 0.5, 0.7), uLight);
  vec3 col = ink * (0.94 + 0.1 * streak) * (1.0 - 0.12 * press);
  col = mix(col, ink * 0.82, smoothstep(1.5, 0.0, -d) * 0.5);
  float a = mix(0.92, 0.78, uLight) * (1.0 - 0.55 * dry) * body * presence(fade);
  return vec4(col * a, a);
}`,
}
