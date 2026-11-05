import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { screen, tone } from './shared'

export const pixel: Preset = {
  name: 'pixel',
  pad: [18, 30, 14],
  tint: [0.6, 0.5, 1],
  selection: { dark: 'color:#fbf9ff', light: 'color:#1a1236' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float size = 3.0;
  vec2 cell = floor(local / size);
  vec2 px = (cell + 0.5) * size;
  float d = sdRBox(px, hs, 6.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float dissolve = step(hash(cell + seed), age * 5.0);
  float body = step(d, 0.0) * dissolve;
  float ring = step(-size, d);
  float upper = step(px.y, 0.0);
  vec3 fill = sky(vec3(0.17, 0.12, 0.38), vec3(0.85, 0.82, 1.0));
  vec3 hi = sky(vec3(0.42, 0.34, 0.85), vec3(1.0, 1.0, 1.0));
  vec3 lo = sky(vec3(0.08, 0.05, 0.2), vec3(0.62, 0.56, 0.95));
  vec3 col = mix(fill, mix(lo, hi, upper), ring);
  float dither = step(0.5, mod(cell.x + cell.y, 2.0)) * step(-2.0 * size, d) * (1.0 - ring);
  col = mix(col, mix(lo, hi, upper), dither * 0.5);
  float glint = step(0.985, hash(cell + floor(t * 3.0))) * (1.0 - ring);
  col = mix(col, hi, glint * 0.6);
  vec4 c = vec4(col, 1.0) * body * 0.95;
  float outline = step(d, size) * step(0.0, d) * dissolve;
  c = over(c, sky(vec3(0.03, 0.02, 0.08), vec3(0.3, 0.24, 0.6)), outline);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = floor(p * 2.5 + 0.5);
  float frame = floor(life * 6.0);
  float reach = frame < 1.0 || frame > 4.0 ? 1.0 : 2.0;
  float arm = (step(abs(q.x), 0.0) * step(abs(q.y), reach) + step(abs(q.y), 0.0) * step(abs(q.x), reach));
  float core = step(abs(q.x) + abs(q.y), 0.0);
  float star = min(arm, 1.0);
  vec3 c = mix(sky(vec3(0.7, 0.6, 1.0), vec3(0.45, 0.32, 0.95)), vec3(1.0), core);
  return vec4(c * star * alpha, star * alpha);
}`,
  behavior: rise({ rate: 2.5, speed: [10, 26], wobble: 0, size: [10, 14], life: [0.6, 1.1] }),
}
