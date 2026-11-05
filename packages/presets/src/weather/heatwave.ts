import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { atmosphere } from './shared'
import { motes } from './sprites'

export const heatwave: Preset = {
  name: 'heatwave',
  pad: [28, 56, 22],
  tint: [1, 0.46, 0.18],
  selection: { dark: 'color:#fff3e6;text-shadow:0 0 8px rgb(255 120 40 / .45)', light: 'color:#2e1206' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float wobble = sin(local.y * 0.35 + t * 5.0 + noise(vec2(world.x * 0.05, t)) * 3.0) * 1.6 * smoothstep(hs.y, -hs.y - 40.0, local.y);
  vec2 lp = local + vec2(wobble, 0.0);
  float d = sdRBox(lp, hs, 6.0);
  if (fade < 0.001 || d > 56.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.6, age);
  float body = solid(d) * open;
  float heat = smoothstep(-hs.y - 4.0, hs.y + 2.0, lp.y);
  vec3 ground = sky(mix(vec3(0.17, 0.05, 0.04), vec3(0.45, 0.14, 0.03), heat), mix(vec3(1.0, 0.9, 0.78), vec3(1.0, 0.72, 0.5), heat));
  vec4 c = vec4(ground, 1.0) * body * 0.9;
  vec2 q = vec2(world.x * 0.02, (world.y + t * 26.0) * 0.07);
  float shimmer = sin(q.y * 6.0 + fbm3(q + seed * 3.0) * 7.0);
  float rising = pow(0.5 + 0.5 * shimmer, 10.0) * smoothstep(hs.y, -hs.y - 50.0, local.y) * smoothstep(-hs.y - 54.0, -hs.y, local.y);
  float above = (1.0 - solid(d)) * smoothstep(hs.x + 14.0, hs.x - 10.0, abs(local.x));
  c = over(c, sky(vec3(1.0, 0.5, 0.18), vec3(0.95, 0.5, 0.2)), rising * above * 0.28 * open);
  c = over(c, sky(vec3(1.0, 0.7, 0.4), vec3(1.0, 0.95, 0.88)), rising * body * 0.2);
  float mirage = exp(-abs(lp.y - hs.y + 3.0) / 2.0) * (0.5 + 0.5 * sin(world.x * 0.08 - t * 4.0 + seed * 9.0));
  c = over(c, sky(vec3(1.0, 0.8, 0.5), vec3(1.0, 0.98, 0.94)), mirage * body * 0.45);
  float sun = exp(-length(local - vec2(hs.x * 0.65, -hs.y - 26.0)) / 16.0) * smoothstep(60.0, 160.0, hs.x);
  c += vec4(sky(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.6, 0.25)), sky(vec3(0.0), vec3(0.6))) * sun * open * 0.45;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: motes([1, 0.6, 0.25], [0.85, 0.38, 0.12]),
  behavior: drift({ density: 2, wind: 0, fall: -36, gust: 40, size: [4, 7], life: [1.2, 2.2], reach: 8 }),
}
