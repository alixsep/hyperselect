import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const candy: Preset = {
  name: 'candy',
  pad: [22, 40, 18],
  tint: [0.95, 0.3, 0.38],
  selection: { dark: 'color:#fff;text-shadow:0 1px 2px rgb(90 0 20 / .7)', light: 'color:#3a0610;text-shadow:0 0 6px rgb(255 255 255 / .9)' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float y = clamp(local.y / hs.y, -1.0, 1.0);
  float bend = asin(y) * hs.y * 0.9;
  float band = fract((world.x - local.y + bend * 0.3 - t * 14.0) / 26.0 + seed);
  float red = smoothstep(0.02, 0.06, band) * smoothstep(0.42, 0.38, band);
  float thin = smoothstep(0.58, 0.6, band) * smoothstep(0.66, 0.64, band);
  vec3 white = sky(vec3(0.86, 0.82, 0.84), vec3(1.0, 0.98, 0.97));
  vec3 cherry = sky(vec3(0.72, 0.06, 0.14), vec3(0.92, 0.16, 0.24));
  vec3 mint = sky(vec3(0.22, 0.62, 0.45), vec3(0.3, 0.75, 0.55));
  vec3 base = mix(mix(white, cherry, red), mint, thin);
  float shade = 1.0 - 0.45 * y * y;
  vec3 col = base * shade * mix(0.55, 1.0, uLight);
  vec4 c = vec4(col, 1.0) * body * 0.94;
  float spec = exp(-pow((y + 0.5) * 4.0, 2.0)) * 0.55 + exp(-pow((y - 0.7) * 6.0, 2.0)) * 0.12;
  c = over(c, vec3(1.0), spec * body);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = vec2(p.x, p.y / max(abs(params.y), 0.35));
  float sweet = length(q / vec2(0.44, 0.34)) - 1.0;
  float ax = abs(q.x) - 0.42;
  float wing = max(abs(q.y) - (0.08 + ax * 0.9), max(-ax, ax - 0.5));
  float folds = 0.85 + 0.15 * sin(q.y * 40.0);
  float wrap = solid(wing * 3.0);
  float ball = solid(sweet * 0.4);
  float stripe = step(0.5, fract((q.x + q.y) * 3.0 + seed * 3.0));
  vec3 color = candy(seed);
  vec3 c = mix(color, vec3(1.0), stripe * 0.75) * (0.75 + 0.35 * smoothstep(0.4, -0.3, q.y));
  vec2 g = q - vec2(-0.14, 0.14);
  c += exp(-dot(g, g) * 60.0) * 0.6;
  vec3 paper = mix(color, vec3(1.0), 0.35) * folds;
  float a = max(ball, wrap);
  return vec4(mix(paper * wrap, c, ball) * alpha, a * alpha);
}`,
  behavior: toss({ burst: 8, rate: 1.6, speed: [220, 380], spread: 0.5, gravity: 900, drag: 0.6, size: [14, 18], life: [1.6, 2.4], spin: 6, bounce: 0.4 }),
}
