import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const valentine: Preset = {
  name: 'valentine',
  pad: [22, 20, 18],
  tint: [0.95, 0.3, 0.45],
  selection: { dark: 'color:#fff3f6;text-shadow:0 1px 2px rgb(40 0 14 / .6)', light: 'color:#3a0a18' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float shown = smoothstep(0.0, 0.25, age);
  float body = solid(d) * shown;
  vec4 c = vec4(sky(vec3(0.3, 0.06, 0.13), vec3(1.0, 0.87, 0.9)), 1.0) * body * 0.92;

  vec2 edge = abs(local) - hs;
  float s = edge.x > edge.y ? local.y : local.x;
  float u = fract(s / 7.0) * 2.0 - 1.0;
  float scallop = d - 3.2 - 2.2 * sqrt(max(1.0 - u * u, 0.0));
  float holes = solid(length(vec2(u * 3.5, d - 2.4)) - 1.05) + solid(length(vec2(fract(s / 3.5 + 0.5) * 3.5 - 1.75, d - 0.2)) - 0.45);
  float lace = solid(scallop) * (1.0 - solid(d + 1.2)) * (1.0 - min(holes, 1.0)) * shown;
  c = over(c, sky(vec3(0.0), vec3(0.6, 0.2, 0.32)), solid(scallop - 1.0) * (1.0 - lace) * (1.0 - body) * shown * uLight * 0.18);
  c = over(c, sky(vec3(0.98, 0.9, 0.93), vec3(1.0, 0.98, 0.99)), lace * 0.95);
  c = over(c, vec3(0.9, 0.55, 0.65), stroke(scallop, 0.3) * shown * uLight * 0.5);

  vec2 p = local - vec2(hs.x - 6.0, -hs.y + 1.0);
  float wax = length(p) - 6.5 + 0.45 * sin(atan(p.y, p.x) * 7.0 + seed * 9.0);
  float pressed = smoothstep(0.0, 0.25, age - 0.35);
  float seal = solid(wax) * (1.0 - cover) * step(40.0, hs.x) * pressed;
  float mark = heart(vec2(p.x, -p.y) / 3.6 + vec2(0.0, 0.05)) * 3.6;
  vec3 red = vec3(0.66, 0.06, 0.13) * (1.0 - 0.25 * smoothstep(-3.0, 0.0, wax));
  red = mix(red, vec3(0.42, 0.02, 0.07), stroke(mark, 0.5));
  red = mix(red, vec3(0.9, 0.3, 0.36), stroke(mark + 0.8, 0.35) * 0.6 + solid(length(p + vec2(2.5, 2.8)) - 1.2) * 0.4);
  c = over(c, vec3(0.2, 0.0, 0.04), solid(wax - 1.2) * (1.0 - cover) * step(40.0, hs.x) * pressed * 0.25);
  c = over(c, red, seal);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
