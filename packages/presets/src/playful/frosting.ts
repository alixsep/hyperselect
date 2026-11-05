import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const frosting: Preset = {
  name: 'frosting',
  pad: [22, 18, 24],
  tint: [1, 0.66, 0.78],
  selection: { dark: 'color:#fff8f2', light: 'color:#3a1a10' },
  surface: /* glsl */ `${festive}
vec4 rosette(vec2 q, float r, float swirl) {
  float l = length(q);
  float a = atan(q.y, q.x);
  float ridges = 0.5 + 0.5 * cos(a * 6.0 + l * swirl);
  float dome = sqrt(max(1.0 - (l * l) / (r * r), 0.0));
  return vec4(dome, ridges, l - r * (0.92 + 0.08 * ridges), 0.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 24.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float smear = noise(vec2(world.x * 0.04, world.y * 0.15) + seed * 3.0);
  vec3 cake = sky(mix(vec3(0.2, 0.1, 0.07), vec3(0.26, 0.14, 0.1), smear), mix(vec3(1.0, 0.96, 0.9), vec3(1.0, 0.93, 0.88), smear));
  vec4 c = vec4(cake, 1.0) * body * 0.92;
  vec3 cream = sky(vec3(1.0, 0.72, 0.82), vec3(1.0, 0.68, 0.8));
  vec3 shade = sky(vec3(0.72, 0.35, 0.5), vec3(0.88, 0.45, 0.6));
  float spacing = 10.0;
  float u = local.x + hs.x;
  float piped = smoothstep(0.0, 1.4, age) * (hs.x * 2.0 + spacing);
  float id = floor(u / spacing);
  vec2 q = vec2(mod(u, spacing) - spacing * 0.5, local.y - hs.y + 0.5);
  float r = 5.6 * smoothstep(0.0, spacing * 2.0, piped - id * spacing);
  vec4 rose = rosette(q, max(r, 0.01), 1.1);
  float on = solid(rose.z) * step(0.1, r) * step(abs(local.x), hs.x + 2.0);
  vec3 col = mix(shade, cream, sqrt(rose.x) * (0.65 + 0.35 * rose.y));
  col += pow(rose.x, 6.0) * smoothstep(0.0, -3.0, q.x + q.y) * 0.25;
  c = over(c, col, on);
  vec2 g = world / 6.0 + seed * 5.0;
  vec2 cell = floor(g);
  vec2 s = turn(hash(cell) * 6.2832) * ((fract(g) - 0.5) * 6.0);
  float pearl = solid(length(s) - 0.9) * step(0.9, hash(cell + 2.0)) * smoothstep(-5.0, -7.0, d) * smoothstep(0.8, 1.6, age);
  c = over(c, sky(vec3(0.95, 0.85, 0.65), vec3(0.85, 0.7, 0.45)), pearl);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
