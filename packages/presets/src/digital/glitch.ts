import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const glitch: Preset = {
  name: 'glitch',
  pad: [26, 12, 12],
  tint: [0.95, 0.3, 0.55],
  selection: { dark: 'color:#fff;text-shadow:-1px 0 rgb(255 40 90 / .7),1px 0 rgb(40 230 255 / .7)', light: 'color:#140a1a;text-shadow:-1px 0 rgb(255 40 90 / .45),1px 0 rgb(0 180 220 / .45)' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 26.0 || abs(local.y) > hs.y + 10.0) return vec4(0.0);
  float tick = floor(t * 14.0);
  float cycle = fract(t * 0.55 + seed * 3.7);
  float burst = step(cycle, 0.16) + step(age, 0.35);
  float slice = floor((world.y + hash(vec2(tick, 1.0)) * 6.0) / (2.0 + floor(hash(vec2(tick, seed)) * 4.0) * 2.0));
  float shift = (hash(vec2(slice, tick)) - 0.5) * 22.0 * step(0.55, hash(vec2(slice + 3.0, tick))) * min(burst, 1.0);
  float split = 1.0 + 3.5 * min(burst, 1.0);
  vec2 p = local - vec2(shift, 0.0);
  vec3 dist = vec3(sdBox(p + vec2(split, 0.0), hs), sdBox(p, hs), sdBox(p - vec2(split, 0.0), hs));
  vec3 bodies = vec3(solid(dist.x), solid(dist.y), solid(dist.z)) * smoothstep(0.0, 0.08, age);
  vec3 base = sky(vec3(0.13, 0.08, 0.17), vec3(0.95, 0.94, 0.97));
  float red = bodies.x * (1.0 - bodies.z);
  float cyan = bodies.z * (1.0 - bodies.x);
  vec3 col = base * bodies.y + sky(vec3(0.55, 0.0, 0.18), vec3(1.0, 0.45, 0.7)) * red + sky(vec3(0.0, 0.4, 0.5), vec3(0.4, 0.85, 1.0)) * cyan;
  float a = max(max(bodies.x, bodies.y), bodies.z);
  vec4 c = vec4(col * a, a) * 0.94;
  vec2 blk = floor(world / vec2(10.0, 3.0));
  float corrupt = step(0.975, hash(blk + tick)) * min(burst, 1.0) * bodies.y;
  c = over(c, mix(vec3(0.0, 0.95, 0.9), vec3(1.0, 0.15, 0.5), hash(blk + 1.0)), corrupt * 0.75);
  float flicker = step(0.92, hash(vec2(floor(world.y / 2.0), tick))) * 0.08;
  c.rgb += sky(vec3(flicker), vec3(-flicker)) * bodies.y;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
