import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const gumballs: Preset = {
  name: 'gumballs',
  pad: [20, 40, 16],
  tint: [0.4, 0.75, 0.95],
  selection: { dark: 'color:#f6fbff', light: 'color:#10202e' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.07, 0.12, 0.2), vec3(0.88, 0.94, 0.99)), 1.0) * body * 0.88;
  float streak = smoothstep(0.7, 1.0, sin((local.x - local.y * 0.6) * 0.05 + 1.0)) * 0.4 + exp(-abs(local.y + hs.y - 3.0)) * 0.5;
  c = over(c, vec3(1.0), streak * body * mix(0.25, 0.6, uLight));
  float cell = 7.0;
  float id = floor(world.x / cell);
  float h = hash(vec2(id, seed));
  float r = 2.6 + 0.6 * h;
  vec2 q = vec2(mod(world.x, cell) - cell * 0.5, local.y - hs.y + r + 0.5);
  float ball = solid(length(q) - r) * step(h * 3.5 + 0.8, age) * step(0.3, fract(h * 13.0)) * step(abs(local.x), hs.x - 3.0);
  vec2 s = q + vec2(r * 0.35, r * 0.4);
  vec3 color = candy(fract(h * 5.7)) * (0.75 + 0.35 * smoothstep(r, -r, q.y)) + exp(-dot(s, s) * 0.6) * 0.8;
  c = over(c, color, ball);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = p * 1.08;
  float r = length(q);
  float ball = solid(r - 0.92);
  vec3 n = vec3(q, sqrt(max(1.0 - r * r, 0.0)));
  float diffuse = clamp(dot(n, normalize(vec3(-0.5, 0.6, 0.7))), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(vec3(0.0, 0.0, -1.0), n), normalize(vec3(-0.4, 0.5, 0.8))), 0.0, 1.0), 30.0);
  vec3 c = candy(seed) * (0.45 + 0.65 * diffuse) + spec * 0.9 + candy(seed) * smoothstep(0.6, 0.95, r) * 0.2;
  return vec4(c * ball * alpha, ball * alpha);
}`,
  behavior: toss({ burst: 10, rate: 2, speed: [220, 380], spread: 0.35, gravity: 1150, drag: 0.15, size: [9, 13], life: [2.4, 3.4], bounce: 0.55 }),
}
