import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const hearts: Preset = {
  name: 'hearts',
  pad: [22, 44, 18],
  tint: [1, 0.42, 0.58],
  selection: { dark: 'color:#fff4f7', light: 'color:#2e0e18' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 44.0) return vec4(0.0);
  float beat = pow(max(sin(t * 5.2), 0.0), 8.0) + pow(max(sin(t * 5.2 - 0.7), 0.0), 8.0) * 0.6;
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.3, 0.06, 0.13), vec3(1.0, 0.86, 0.9)), 1.0) * body * 0.9;
  c += vec4(sky(vec3(0.6, 0.12, 0.25), vec3(0.0)), sky(vec3(0.0), vec3(0.15))) * exp(-max(d, 0.0) / 7.0) * (1.0 - solid(d)) * (0.3 + 0.25 * beat) * smoothstep(0.0, 0.3, age);
  vec2 g = vec2(world.x / 16.0, world.y / 14.0) + seed * 9.0;
  vec2 id = floor(g);
  vec2 q = (fract(g) - 0.5) * vec2(16.0, 14.0);
  float size = 3.0 + hash(id) * 1.5;
  float tiny = solid(heart(vec2(q.x, -q.y) / size) * size) * step(0.55, hash(id + 2.0));
  c = over(c, sky(vec3(0.5, 0.12, 0.24), vec3(1.0, 0.7, 0.78)), tiny * body * (0.5 + 0.3 * beat));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float beat = 1.0 + 0.08 * pow(max(sin(t * 5.2 + seed * 6.0), 0.0), 8.0);
  vec2 q = p * 1.25 / beat;
  float d = heart(q);
  float shape = solid(d);
  vec2 s = q - vec2(-0.32, 0.3);
  float gloss = smoothstep(0.2, 0.0, length(s * vec2(1.0, 1.6)));
  vec3 base = mix(vec3(1.0, 0.25, 0.45), vec3(1.0, 0.55, 0.7), seed);
  vec3 c = base * (0.7 + 0.4 * smoothstep(-0.6, 0.6, q.y)) + gloss * 0.6;
  return vec4(c * shape * alpha, shape * alpha);
}`,
  behavior: rise({ rate: 2.4, speed: [30, 60], wobble: 14, size: [10, 18], life: [1.6, 2.6] }),
}
