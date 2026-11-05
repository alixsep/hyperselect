import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const easter: Preset = {
  name: 'easter',
  pad: [20, 12, 12],
  tint: [0.95, 0.6, 0.75],
  selection: { dark: 'color:#fdf8ff', light: 'color:#24183a' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float d = sdRBox(local, hs, hs.y);
  if (fade < 0.001 || d > 6.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float dye = fbm3(world * 0.05 + seed * 4.0);
  vec3 shell = sky(mix(vec3(0.17, 0.14, 0.27), vec3(0.2, 0.15, 0.28), dye), mix(vec3(0.95, 0.93, 1.0), vec3(0.98, 0.93, 0.98), dye));
  vec4 c = vec4(shell, 1.0) * body * 0.94;
  vec3 pink = sky(vec3(1.0, 0.58, 0.72), vec3(0.94, 0.46, 0.62));
  vec3 yolk = sky(vec3(1.0, 0.82, 0.36), vec3(0.95, 0.68, 0.18));
  vec3 mint = sky(vec3(0.45, 0.86, 0.72), vec3(0.24, 0.68, 0.54));
  vec3 blue = sky(vec3(0.55, 0.72, 1.0), vec3(0.36, 0.55, 0.92));
  float painted = smoothstep(0.0, 12.0, age * 500.0 - local.x - hs.x);
  float zig = local.y + hs.y - 3.0 - (abs(fract(world.x / 7.0) - 0.5) * 2.0 - 0.5) * 2.6;
  c = over(c, pink, stroke(zig, 0.8) * body * painted);
  c = over(c, mint, stroke(d + 0.9, 0.5) * body * painted * 0.9);
  float row = local.y - hs.y + 3.0;
  c = over(c, yolk, solid(length(vec2(mod(world.x, 7.0) - 3.5, row)) - 1.25) * body * painted);
  c = over(c, blue, solid(length(vec2(mod(world.x + 3.5, 7.0) - 3.5, row)) - 0.55) * body * painted * 0.9);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
