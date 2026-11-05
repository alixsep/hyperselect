import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { screen, tone } from './shared'

export const binary: Preset = {
  name: 'binary',
  pad: [16, 34, 12],
  tint: [0.35, 0.7, 1],
  selection: { dark: 'color:#f2f8ff', light: 'color:#0a1a33' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  vec4 c = vec4(sky(vec3(0.03, 0.06, 0.12), vec3(0.93, 0.96, 1.0)), 1.0) * body * 0.94;
  float row = floor(world.y / 8.0);
  float dir = mod(row, 2.0) < 1.0 ? 1.0 : -1.0;
  float speed = 10.0 + hash(vec2(row, seed)) * 24.0;
  float x = world.x + dir * t * speed;
  vec2 cell = vec2(floor(x / 5.0), row);
  float bit = step(0.5, hash(cell + floor(t * (0.5 + hash(cell) * 2.0)) * 0.37 + seed));
  float byte = floor(cell.x / 8.0);
  float hot = step(0.86, hash(vec2(byte, row) + floor(t * 0.7)));
  vec2 p = vec2(mod(x, 5.0) - 0.7, mod(world.y, 8.0) - 1.0);
  float glyph = digit(p, int(bit), 1.2);
  vec3 cool = sky(vec3(0.25, 0.45, 0.8), vec3(0.45, 0.6, 0.9));
  vec3 bright = sky(vec3(0.55, 0.9, 1.0), vec3(0.1, 0.35, 0.85));
  c = over(c, mix(cool, bright, hot), glyph * body * mix(0.3, 0.8, hot));
  c = over(c, bright, stroke(d + 0.5, 0.4) * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = vec2((p.x + 0.6) * 2.5, (0.75 - p.y) * 3.333);
  float glyph = digit(q, int(kind), 1.0);
  float glow = exp(-dot(p, p) * 3.0) * 0.25;
  vec3 ink = sky(vec3(0.6, 0.9, 1.0), vec3(0.12, 0.38, 0.85));
  float a = (glyph + glow * (1.0 - uLight)) * alpha;
  return vec4(ink * a, clamp(a, 0.0, 1.0) * mix(0.8, 0.9, uLight));
}`,
  behavior: rise({ rate: 3.5, speed: [18, 40], wobble: 0, size: [9, 13], life: [0.9, 1.6], variants: 2 }),
}
