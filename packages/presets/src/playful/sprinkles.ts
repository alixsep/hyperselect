import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const sprinkles: Preset = {
  name: 'sprinkles',
  pad: [20, 28, 16],
  tint: [0.98, 0.56, 0.7],
  selection: { dark: 'color:#fff5f8', light: 'color:#2c1220' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float wave = sin(world.x * 0.18 + seed * 9.0) * 1.2 + sin(world.x * 0.07) * 1.0;
  float d = sdRBox(local, hs, 9.0) + (local.y < 0.0 ? wave : 0.0);
  if (fade < 0.001 || d > 28.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float shine = exp(-pow((local.y + hs.y * 0.45) / (hs.y * 0.35), 2.0));
  vec3 icing = sky(vec3(0.42, 0.13, 0.27), vec3(1.0, 0.8, 0.88));
  vec4 c = vec4(icing + sky(vec3(0.16, 0.08, 0.12), vec3(0.06, 0.08, 0.06)) * shine, 1.0) * body * 0.94;
  vec2 g = world / 9.0 + seed * 11.0;
  vec2 id = floor(g);
  vec2 h = hash2(id);
  vec2 q = turn(h.x * 6.2832) * ((fract(g) - 0.5 - (h - 0.5) * 0.4) * 9.0);
  float sprinkle = solid(length(vec2(max(abs(q.x) - 1.8, 0.0), q.y)) - 0.8) * step(0.35, hash(id + 3.0)) * step(hash(id + 5.0) * 3.0 + 0.3, age);
  c = over(c, candy(h.y) * (0.9 + 0.2 * smoothstep(0.0, -0.8, q.y)), sprinkle * body);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float d = length(vec2(max(abs(p.y) - 0.62, 0.0), p.x)) - 0.26;
  float body = solid(d);
  float gloss = smoothstep(0.2, -0.05, abs(p.x + 0.1)) * 0.35;
  vec3 c = candy(seed) + gloss;
  return vec4(c * body * alpha, body * alpha);
}`,
  behavior: toss({ burst: 26, rate: 3, speed: [140, 320], spread: 0.6, gravity: 950, drag: 0.6, size: [7, 10], life: [2, 3.2], spin: 9, bounce: 0.35 }),
}
