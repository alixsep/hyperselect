import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { atmosphere } from './shared'
import { motes } from './sprites'

export const drought: Preset = {
  name: 'drought',
  pad: [26, 30, 18],
  tint: [0.82, 0.56, 0.32],
  selection: { dark: 'color:#fdf3e6', light: 'color:#2a1a0c' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.5);
  float d = sdRBox(local, hs, 3.0) + (noise(world * 0.2) - 0.5) * 2.0;
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(0.0);
  if (body > 0.0) {
    vec2 warp = (vec2(fbm3(world * 0.05 + seed), fbm3(world * 0.05 + seed + 4.0)) - 0.5) * 0.7;
    vec3 v = voronoi(world * 0.075 + warp + seed * 9.0);
    float origin = (hash(vec2(seed, 2.0)) - 0.5) * hs.x;
    float spread = age * 260.0 - abs(local.x - origin) - (v.z - 0.5) * 60.0;
    float split = smoothstep(0.0, 30.0, spread);
    float gap = v.y - v.x;
    float crack = (1.0 - smoothstep(0.0, mix(0.001, 0.11, split), gap)) * step(0.01, split);
    float curl = smoothstep(0.25, 0.0, gap) * split;
    float tone = 0.8 + 0.25 * v.z + (fbm(world * 0.2) - 0.5) * 0.3;
    vec3 clay = sky(vec3(0.36, 0.22, 0.12), vec3(0.9, 0.78, 0.6)) * tone;
    clay += sky(vec3(0.12, 0.08, 0.04), vec3(0.08, 0.07, 0.05)) * curl;
    c = vec4(clay, 1.0) * body * 0.94;
    c = over(c, sky(vec3(0.06, 0.03, 0.02), vec3(0.6, 0.42, 0.26)), crack * body);
  }
  float dust = smoothstep(0.45, 0.8, fbm3(vec2(world.x * 0.02 - t * 0.6, world.y * 0.08))) * (1.0 - solid(d)) * solid(d - 26.0) * smoothstep(hs.y, -hs.y - 30.0, local.y);
  c = over(c, sky(vec3(0.45, 0.32, 0.2), vec3(0.85, 0.72, 0.56)), dust * 0.4 * smoothstep(0.3, 1.5, age));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: motes([0.95, 0.75, 0.5], [0.6, 0.4, 0.22]),
  behavior: drift({ density: 2.5, wind: 45, fall: -6, gust: 30, size: [3, 6], life: [1.5, 3], reach: 10 }),
}
