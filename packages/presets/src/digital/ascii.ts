import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const ascii: Preset = {
  name: 'ascii',
  pad: [16, 14, 14],
  tint: [0.85, 0.75, 0.5],
  selection: { dark: 'color:#fffaf0', light: 'color:#221a08' },
  surface: /* glsl */ `${screen}
const uint ramp[10] = uint[10](0u, 8192u, 1040u, 448u, 3640u, 1488u, 3048u, 24445u, 31727u, 32767u);

float character(vec2 p, int code) {
  return bitmap(p - vec2(0.6, 1.0), ramp[clamp(code, 0, 9)], 1.6);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  vec2 cellSize = vec2(6.0, 10.0);
  vec2 cell = floor(world / cellSize);
  vec2 center = (cell + 0.5) * cellSize;
  float wave = sin(center.x * 0.045 + t * 1.3) * cos(center.y * 0.11 - t * 0.9) * 0.5 + 0.5;
  float field = clamp(wave * 0.7 + fbm3(center * 0.02 + vec2(t * 0.2, seed * 5.0)) * 0.5 - 0.15, 0.0, 1.0);
  float typed = step(hash(cell + seed) * 0.5 + (center.x - world.x + local.x + hs.x) / max(hs.x * 2.0, 1.0) * 0.35, age * 1.6);
  float body = step(d, 0.0);
  vec4 c = vec4(sky(vec3(0.11, 0.09, 0.06), vec3(0.98, 0.96, 0.9)), 1.0) * body * 0.94;
  float ink = character(mod(world, cellSize), int(field * 9.99)) * typed;
  c = over(c, sky(vec3(0.62, 0.52, 0.3), vec3(0.62, 0.5, 0.25)), ink * body * mix(0.5, 0.45, uLight));
  vec2 o = local + hs + cellSize;
  float col = floor(o.x / cellSize.x);
  float last = floor((hs.x * 2.0 + cellSize.x) / cellSize.x);
  float top = step(-hs.y - cellSize.y, local.y) * step(local.y, -hs.y);
  float bottom = step(hs.y, local.y) * step(local.y, hs.y + cellSize.y);
  float side = step(abs(local.y), hs.y) * (step(col, 0.0) + step(last, col));
  vec2 cp = vec2(mod(o.x, cellSize.x), mod(local.y + hs.y + cellSize.y * 4.0, cellSize.y));
  bool corner = col <= 0.0 || col >= last;
  float edge = (top + bottom) * bitmap(cp - vec2(0.6, 1.0), corner ? 1488u : 448u, 1.6) + side * bitmap(cp - vec2(0.6, 1.0), 9362u, 1.6);
  float drawn = step(col, age * 90.0) * step(-1.0, col) * step(col, last);
  c = over(c, sky(vec3(1.0, 0.82, 0.45), vec3(0.55, 0.38, 0.1)), edge * drawn);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
