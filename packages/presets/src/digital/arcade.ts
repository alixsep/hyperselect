import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { screen, tone } from './shared'

export const arcade: Preset = {
  name: 'arcade',
  pad: [18, 30, 16],
  tint: [0.95, 0.45, 0.85],
  selection: { dark: 'color:#fff6fd', light: 'color:#1e0a30' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  vec2 px = (floor(local / 2.0) + 0.5) * 2.0;
  float d = sdBox(px, hs - 2.0) - 2.0;
  if (fade < 0.001 || d > 24.0) return vec4(0.0);
  float boot = smoothstep(0.0, 0.25, age);
  float body = step(d, 0.0) * step(hash(floor(local / 2.0) + seed), boot * 1.2);
  vec4 c = vec4(sky(vec3(0.1, 0.06, 0.2), vec3(0.95, 0.93, 1.0)), 1.0) * body * 0.94;
  for (int layer = 0; layer < 2; layer++) {
    float fl = float(layer);
    float size = 2.0;
    vec2 g = floor((world + vec2(t * (14.0 + fl * 22.0), 0.0)) / (12.0 + fl * 6.0));
    vec2 cellPos = mod(world + vec2(t * (14.0 + fl * 22.0), 0.0), 12.0 + fl * 6.0);
    vec2 spot = floor(hash2(g + fl * 7.0 + seed) * (10.0 + fl * 6.0) / size) * size;
    float star = step(spot.x, cellPos.x) * step(cellPos.x, spot.x + size) * step(spot.y, cellPos.y) * step(cellPos.y, spot.y + size) * step(0.55, hash(g + 3.0 + fl));
    float blink = step(0.3, fract(t * (0.8 + hash(g) * 1.5) + hash(g + 5.0)));
    c = over(c, sky(vec3(0.55, 0.5, 0.9), vec3(0.6, 0.55, 0.9)) * (0.6 + fl * 0.4), star * blink * body * (0.35 + fl * 0.3));
  }
  float rim = step(-2.0, d) * body;
  float lit = step(px.y, 0.0);
  c = over(c, mix(sky(vec3(0.55, 0.12, 0.6), vec3(0.62, 0.3, 0.85)), sky(vec3(1.0, 0.45, 0.9), vec3(0.85, 0.4, 0.95)), lit), rim);
  float n = floor(age * 230.0 + seed * 900.0);
  vec2 sp = vec2(local.x - hs.x + 36.0, local.y + hs.y + 10.0);
  float score = 0.0;
  for (int k = 0; k < 6; k++) {
    float place = pow(10.0, float(5 - k));
    score += digit(sp - vec2(float(k) * 6.0, 0.0), int(mod(floor(n / place), 10.0)), 1.5);
  }
  c = over(c, sky(vec3(1.0, 0.85, 0.3), vec3(0.75, 0.3, 0.75)), score * boot * (1.0 - cover) * step(40.0, hs.x));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float squash = max(abs(params.y), 0.18);
  vec2 q = (floor(vec2(p.x / squash, p.y) * 6.0) + 0.5) / 6.0;
  float r = length(q);
  float coin = step(r, 0.86);
  float rim = step(0.66, r) * coin;
  float slot = step(abs(q.x), 0.1) * step(abs(q.y), 0.45);
  vec3 gold = mix(vec3(1.0, 0.82, 0.25), vec3(0.85, 0.5, 0.1), rim);
  gold = mix(gold, vec3(1.0, 0.97, 0.75), slot * step(0.0, params.y));
  gold = mix(gold, vec3(0.75, 0.42, 0.08), slot * step(params.y, 0.0));
  return vec4(gold * coin * alpha, coin * alpha);
}`,
  behavior: toss({ burst: 6, rate: 1.4, speed: [240, 360], spread: 0.35, gravity: 820, drag: 0.4, size: [12, 14], life: [1.1, 1.6], bounce: 0.3 }),
}
