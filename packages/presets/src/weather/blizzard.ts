import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { snowflakes } from './sprites'
import { atmosphere } from './shared'

export const blizzard: Preset = {
  name: 'blizzard',
  pad: [40, 34, 26],
  tint: [0.76, 0.86, 0.96],
  selection: { dark: 'color:#f8fbff;text-shadow:0 0 8px rgb(20 30 50 / .8)', light: 'color:#141c26' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0) + (fbm3(vec2(world.x * 0.03 - t * 2.0, world.y * 0.12)) - 0.5) * 10.0;
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.4, age);
  float body = (1.0 - smoothstep(-2.0, 6.0, d)) * open;
  float gust = fbm(vec2(world.x * 0.012 - t * 1.9, world.y * 0.07 + seed * 3.0));
  float veils = smoothstep(0.35, 0.8, fbm3(vec2(world.x * 0.02 - t * 3.2, world.y * 0.16 + seed)));
  vec3 base = sky(vec3(0.13, 0.17, 0.24), vec3(0.8, 0.85, 0.91));
  vec4 c = vec4(base, 1.0) * body * 0.9;
  c = over(c, sky(vec3(0.5, 0.58, 0.68), vec3(0.97, 0.98, 1.0)), veils * body * mix(0.35, 0.7, gust));
  vec2 wind = vec2(world.y + world.x * 0.12, world.x);
  float streaks = rain(wind, t, vec2(5.0, 70.0), 520.0, 22.0, 0.35, 0.55, seed);
  float flecks = rain(wind * 1.3 + 9.0, t, vec2(4.0, 40.0), 380.0, 8.0, 0.5, 0.5, seed + 3.0);
  float air = (1.0 - smoothstep(10.0, 38.0, d)) * open;
  c = over(c, sky(vec3(0.92, 0.96, 1.0), vec3(1.0)), (streaks * 0.6 + flecks * 0.7) * air);
  float rime = smoothstep(-hs.x + 26.0, -hs.x, local.x) * body;
  float frost = smoothstep(0.55, 0.75, fbm(world * 0.25 + seed * 5.0));
  c = over(c, sky(vec3(0.88, 0.94, 1.0), vec3(1.0)), rime * (0.25 + frost * 0.6));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: snowflakes([0.95, 0.98, 1], [0.5, 0.62, 0.76]),
  behavior: drift({ density: 16, wind: 420, fall: 60, gust: 260, size: [2.5, 5], life: [0.5, 1.1], reach: 40, streak: 0.006 }),
}
