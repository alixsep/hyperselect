import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const oktoberfest: Preset = {
  name: 'oktoberfest',
  pad: [18, 18, 18],
  tint: [0.98, 0.72, 0.2],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(30 14 0 / .7)', light: 'color:#2a1a04' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float poured = smoothstep(0.0, 0.25, age);
  float body = solid(d) * poured;
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.4, 0.23, 0.04), vec3(0.3, 0.15, 0.02), depth), mix(vec3(1.0, 0.92, 0.64), vec3(1.0, 0.85, 0.5), depth)), 1.0) * body * 0.93;
  float col = floor(world.x / 7.0);
  vec2 b = vec2(mod(world.x, 7.0) - 3.5 - (hash(vec2(col, seed)) - 0.5) * 3.0, mod(world.y + t * (14.0 + hash(vec2(col, 3.0)) * 10.0), 6.0) - 3.0);
  float fizz = solid(length(b) - 0.55) * step(0.7, hash(vec2(col, seed + 1.0)));
  c = over(c, sky(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.98, 0.9)), fizz * body * 0.45);

  float bumps = noise(vec2(world.x * 0.28, seed * 3.0)) * 2.2 + noise(vec2(world.x * 0.9, seed)) * 0.8;
  float head = max(max(local.y + hs.y - 1.5, -(local.y + hs.y + 1.0 + bumps)), abs(local.x) - hs.x + 1.0);
  vec3 v = voronoi(world * 0.55 + seed * 2.0);
  vec3 cream = sky(vec3(0.95, 0.9, 0.8), vec3(1.0, 0.99, 0.95)) * (0.9 + 0.1 * smoothstep(0.05, 0.4, v.x));
  float foam = solid(head) * smoothstep(0.1, 0.5, age);
  c = over(c, sky(vec3(0.0), vec3(0.5, 0.36, 0.1)), stroke(head, 0.5) * foam * uLight * 0.4);
  c = over(c, cream, foam);

  vec2 l = vec2(world.x / 5.0, (local.y - hs.y - 3.0) / 2.5);
  float check = mod(floor(l.x + l.y) + floor(l.x - l.y), 2.0);
  float band = solid(sdBox(vec2(local.x, local.y - hs.y - 3.0), vec2(hs.x - 3.0, 2.2))) * smoothstep(0.2, 0.5, age);
  vec3 blue = sky(vec3(0.3, 0.58, 1.0), vec3(0.16, 0.42, 0.86));
  c = over(c, mix(sky(vec3(0.95, 0.97, 1.0), vec3(1.0)), blue, check), band);
  c = over(c, blue, stroke(sdBox(vec2(local.x, local.y - hs.y - 3.0), vec2(hs.x - 3.0, 2.2)), 0.3) * band * uLight);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r = length(p);
  float a = (solid(abs(r - 0.7) - 0.12) * 0.7 + solid(r - 0.7) * 0.2 + solid(length(p - vec2(-0.25, 0.28)) - 0.18) * 0.8) * alpha;
  vec3 color = sky(vec3(1.0, 0.92, 0.7), vec3(0.85, 0.6, 0.15));
  return vec4(color * a, a * mix(0.6, 0.9, uLight));
}`,
  behavior: rise({ rate: 0.9, speed: [24, 46], wobble: 3, size: [3, 5], life: [0.6, 1.0] }),
}
