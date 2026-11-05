import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const matrix: Preset = {
  name: 'matrix',
  pad: [16, 48, 14],
  tint: [0.3, 0.95, 0.5],
  selection: { dark: 'color:#ecffef;text-shadow:0 0 6px rgb(60 255 120 / .6)', light: 'color:#062a12' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 48.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  vec2 cellSize = vec2(7.0, 10.0);
  vec2 cell = floor(world / cellSize);
  float column = hash(vec2(cell.x, seed));
  float rows = 18.0;
  float head = mod(t * (5.0 + column * 7.0) + column * 40.0, rows + 10.0);
  float behind = mod(head - mod(cell.y, rows + 10.0), rows + 10.0);
  float trail = exp(-behind * 0.28) * step(0.25, column);
  float lead = step(behind, 0.9);
  uint bits = uint(hash(cell + floor(t * (1.0 + hash(cell) * 6.0)) * 0.13) * 32767.0);
  float glyph = bitmap(mod(world, cellSize) - vec2(1.4, 1.5), bits | 1170u, 1.4);
  float above = (1.0 - solid(d)) * smoothstep(48.0, 4.0, d) * step(local.y, 0.0) * (1.0 - cover);
  vec4 c = vec4(sky(vec3(0.0, 0.035, 0.015), vec3(0.88, 0.95, 0.9)), 1.0) * body * 0.96;
  vec3 green = sky(vec3(0.2, 0.95, 0.45), vec3(0.1, 0.55, 0.28));
  vec3 white = sky(vec3(0.85, 1.0, 0.9), vec3(0.0, 0.3, 0.12));
  float shade = trail * (0.55 + 0.45 * hash(cell + 9.0));
  c = over(c, mix(green, white, lead), glyph * clamp(shade + lead, 0.0, 1.0) * body * 0.55);
  c = over(c, mix(green, white, lead), glyph * clamp(shade + lead, 0.0, 1.0) * above * 0.7);
  c = over(c, green * 0.5, stroke(d + 0.5, 0.45) * body * 0.6);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
