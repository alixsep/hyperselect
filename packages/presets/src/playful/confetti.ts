import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const confetti: Preset = {
  name: 'confetti',
  pad: [24, 30, 22],
  tint: [0.95, 0.45, 0.55],
  selection: { dark: 'color:#fff6f8', light: 'color:#2a1420' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 7.0);
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float glow = smoothstep(-hs.x, hs.x, local.x + sin(local.y * 0.2 + t) * 4.0);
  vec4 c = vec4(sky(mix(vec3(0.24, 0.07, 0.17), vec3(0.18, 0.08, 0.24), glow), mix(vec3(1.0, 0.91, 0.92), vec3(0.98, 0.92, 1.0), glow)), 1.0) * body * 0.9;
  float slot = floor(world.x / 7.0);
  float h = hash(vec2(slot, seed));
  float landed = step(h * 2.6 + 0.6, age);
  vec2 q = turn(h * 6.2832) * (vec2(mod(world.x, 7.0) - 3.5, local.y - hs.y + 2.5 + h * 2.0));
  float piece = solid(sdBox(q, vec2(1.0, 2.2))) * landed * step(0.35, h) * body;
  c = vec4(mix(c.rgb, candy(fract(h * 7.3)) * c.a, piece), c.a);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float flip = params.y;
  float squash = max(abs(flip), 0.12);
  vec2 q = vec2(p.x / squash, p.y);
  float d;
  if (kind < 0.5) d = sdBox(q, vec2(0.42, 0.78));
  else if (kind < 1.5) d = abs(q.x - sin(q.y * 4.5 + seed * 9.0) * 0.28) - 0.16 + max(abs(q.y) - 0.85, 0.0) * 4.0;
  else d = length(q) - 0.5;
  float paper = solid(d);
  vec3 c = candy(seed) * mix(0.62, 1.08, flip * 0.5 + 0.5);
  c += vec3(0.35) * pow(max(flip, 0.0), 8.0);
  return vec4(c * paper * alpha, paper * alpha);
}`,
  behavior: toss({ burst: 16, rate: 3, speed: [200, 440], spread: 0.55, gravity: 420, drag: 2.2, size: [8, 12], life: [1.8, 2.8], spin: 5, flutter: 420, variants: 3 }),
}
