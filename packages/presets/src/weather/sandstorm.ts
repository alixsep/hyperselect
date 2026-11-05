import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { atmosphere } from './shared'
import { motes } from './sprites'

export const sandstorm: Preset = {
  name: 'sandstorm',
  pad: [40, 30, 22],
  tint: [0.9, 0.66, 0.36],
  selection: { dark: 'color:#fff5e4;text-shadow:0 0 8px rgb(40 20 0 / .7)', light: 'color:#2b1a08' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  vec2 flow = vec2(world.x * 0.012 - t * 2.4, world.y * 0.09 + seed * 3.0);
  float dense = fbm(flow + vec2(fbm3(flow * 0.6) * 1.5, 0.0));
  float d = sdRBox(local, hs, 5.0) + (0.5 - dense) * 22.0;
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.5, age);
  float body = (1.0 - smoothstep(-4.0, 8.0, d)) * open;
  vec3 sand = sky(mix(vec3(0.3, 0.17, 0.07), vec3(0.6, 0.38, 0.17), dense), mix(vec3(0.93, 0.8, 0.6), vec3(0.85, 0.64, 0.38), dense));
  vec4 c = vec4(sand, 1.0) * body * mix(0.7, 0.95, dense);
  float lanes = pow(fbm3(vec2(world.x * 0.004 - t * 3.6, world.y * 0.35 + seed)), 2.0);
  float streak = smoothstep(0.2, 0.45, lanes) * (1.0 - smoothstep(-6.0, 30.0, d));
  c = over(c, sky(vec3(0.85, 0.62, 0.36), vec3(0.98, 0.9, 0.76)), streak * 0.5 * open);
  float ripple = sin(world.x * 0.45 + sin(world.x * 0.05) * 2.0 - t * 1.2) * 0.5 + 0.5;
  float dune = smoothstep(hs.y - 7.0, hs.y, local.y) * body;
  c = over(c, sky(vec3(0.62, 0.4, 0.2), vec3(0.75, 0.55, 0.32)), dune * mix(0.3, 0.75, ripple));
  float grit = step(0.94, hash(floor(world * 0.9) + floor(t * 14.0)));
  c = over(c, sky(vec3(1.0, 0.85, 0.6), vec3(0.55, 0.36, 0.18)), grit * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: motes([1, 0.82, 0.55], [0.55, 0.35, 0.15]),
  behavior: drift({ density: 22, wind: 520, fall: 10, gust: 220, size: [2, 3.5], life: [0.4, 0.9], reach: 36, streak: 0.006 }),
}
