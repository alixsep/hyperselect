import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { snowflakes } from './sprites'
import { atmosphere } from './shared'

export const snow: Preset = {
  name: 'snow',
  pad: [22, 44, 22],
  tint: [0.7, 0.82, 0.95],
  selection: { dark: 'color:#f6f9fc', light: 'color:#18212c' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 44.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.5, age);
  float body = solid(d) * open;
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec3 night = sky(mix(vec3(0.07, 0.11, 0.2), vec3(0.11, 0.16, 0.26), depth), mix(vec3(0.86, 0.91, 0.97), vec3(0.8, 0.87, 0.95), depth));
  vec4 c = vec4(night, 1.0) * body * 0.9;
  c += vec4(sky(vec3(0.15, 0.22, 0.36), vec3(0.7, 0.8, 0.92)), 1.0) * exp(-max(d, 0.0) / 10.0) * (1.0 - solid(d)) * open * 0.2;
  float far = flakes(world, t, 1.3, 14.0, 1.0, 0.35, seed);
  float mid = flakes(world + 70.0, t, 2.0, 24.0, 0.6, 0.3, seed + 5.0);
  float air = solid(d - 38.0) * open;
  c = over(c, sky(vec3(0.68, 0.76, 0.9), vec3(0.6, 0.7, 0.84)), far * air * 0.3);
  c = over(c, sky(vec3(0.9, 0.94, 1.0), vec3(0.98, 1.0, 1.0)), mid * air * 0.7);
  float x = local.x / hs.x;
  float taper = sqrt(max(1.0 - pow(abs(x), 8.0), 0.0));
  float depthOfSnow = smoothstep(0.1, 2.5, age) * (3.5 + 4.0 * fbm3(vec2(world.x * 0.045, seed * 7.0))) * taper;
  float cap = max(-hs.y - depthOfSnow - local.y, local.y + hs.y - 2.5);
  float drift = 1.0 - smoothstep(-1.5, 1.0, cap);
  float shade = smoothstep(-hs.y - depthOfSnow, -hs.y + 2.5, local.y);
  vec3 snowColor = mix(vec3(0.98, 0.99, 1.0), sky(vec3(0.6, 0.7, 0.86), vec3(0.72, 0.8, 0.9)), shade * 0.6);
  float sparkle = step(0.985, hash(floor(world * 0.7) + floor(t * 3.0))) * (1.0 - shade);
  c = over(c, snowColor + sparkle * 0.6, drift * smoothstep(0.0, 0.3, age) * 0.95);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: snowflakes([0.94, 0.97, 1], [0.48, 0.6, 0.76]),
  behavior: drift({ density: 4, wind: 14, fall: 34, gust: 30, size: [5, 11], life: [2.4, 4], reach: 30, spin: 0.8, variants: 2 }),
}
