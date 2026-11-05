import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const constellation: Preset = {
  name: 'constellation',
  pad: [12, 8, 8],
  tint: [0.9, 0.76, 0.42],
  selection: { dark: 'color:#f6f1e2', light: 'color:#14203a' },
  surface: /* glsl */ `${cosmos}
vec2 node(float k, vec2 hs, float seed) {
  float side = hash(vec2(k, seed + 1.0));
  return vec2((k + 0.25 + 0.5 * hash(vec2(k, seed))) * 58.0 - hs.x, (side < 0.5 ? -1.0 : 1.0) * hs.y * (0.55 + 0.6 * fract(side * 2.0) * 0.5));
}

float segment(vec2 p, vec2 a, vec2 b, float drawn) {
  vec2 ab = (b - a) * drawn;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
  return length(p - a - ab * h);
}

float drawn(float k, float age, float seed) {
  return clamp((age - 0.15 - k * 0.07) / 0.2, 0.0, 1.0) * step(0.22, hash(vec2(k, seed + 3.0)));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(0.0, 0.12, age);
  if (inside <= 0.0) return vec4(0.0);
  float k = floor((local.x + hs.x) / 58.0);
  vec2 a = node(k - 1.0, hs, seed), b = node(k, hs, seed), c = node(k + 1.0, hs, seed);
  float last = floor(2.0 * hs.x / 58.0);
  float link = min(segment(local, a, b, drawn(k - 1.0, age, seed) * step(0.0, k - 1.0)),
                   segment(local, b, c, drawn(k, age, seed) * step(k + 1.0, last)));
  float line = smoothstep(1.1, 0.3, link) * step(0.0, k - 0.5 + step(0.5, drawn(k, age, seed)));
  float glow = hash(vec2(k, seed + 2.0));
  float lit = smoothstep(0.1 + k * 0.07, 0.25 + k * 0.07, age) * step(k, last);
  float size = 1.3 + 1.6 * glow;
  float star = point(local - b, size) * lit;
  float halo = smoothstep(1.0, 0.0, abs(length(local - b) - size - 3.0)) * step(0.62, glow) * lit;
  vec2 grid = abs(fract(world / 36.0) - 0.5) * 36.0;
  float graticule = smoothstep(0.7, 0.0, min(grid.x, grid.y)) * 0.5;
  vec4 s = starCell(world, 11.0, seed);
  float dust = step(0.6, s.z) * point(s.xy, 0.2 + 0.3 * s.z);
  float twinkle = 0.85 + 0.15 * sin(t * 1.4 + glow * 30.0);
  vec3 paper = mix(vec3(0.03, 0.045, 0.11), vec3(0.9, 0.92, 0.97), uLight);
  vec3 ink = mix(vec3(0.9, 0.78, 0.5), vec3(0.2, 0.3, 0.56), uLight);
  vec3 bright = mix(vec3(1.0, 0.95, 0.84), vec3(0.1, 0.17, 0.36), uLight);
  vec4 col = vec4(paper, 1.0) * mix(0.88, 0.92, uLight);
  col = over(col, ink, graticule * 0.12 + dust * 0.4);
  col = over(col, ink, line * 0.75);
  col = over(col, ink, halo * 0.7);
  col = over(col, bright, star * twinkle);
  col = over(col, ink, smoothstep(1.2, 0.2, abs(d + 0.8)) * 0.35);
  if (uLight < 0.5) col.rgb += ink * exp(-length(local - b) / (size * 2.0)) * 0.25 * lit;
  return col * inside * fade;
}`,
}
