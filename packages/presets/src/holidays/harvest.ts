import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const harvest: Preset = {
  name: 'harvest',
  pad: [22, 14, 20],
  tint: [0.92, 0.58, 0.2],
  selection: { dark: 'color:#fff7ea;text-shadow:0 1px 2px rgb(30 10 0 / .6)', light: 'color:#2c1606' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float dusk = smoothstep(-hs.y, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.24, 0.11, 0.04), vec3(0.3, 0.13, 0.04), dusk), mix(vec3(1.0, 0.94, 0.82), vec3(1.0, 0.89, 0.74), dusk)), 1.0) * body * 0.93;

  float woven = smoothstep(0.0, 14.0, age * 420.0 - local.x - hs.x);
  vec4 sheaf = vec4(0.0);
  float n = floor(world.x / 3.0);
  for (int i = -1; i <= 1; i++) {
    float m = n + float(i);
    float side = mod(m, 2.0) * 2.0 - 1.0;
    vec2 q = vec2(world.x - (m + 0.5) * 3.0, local.y - hs.y - 1.0 - side * 1.4);
    q = rotate(q, side * 0.6);
    float kernel = length(q * vec2(0.55, 1.0)) - 1.15;
    vec3 grain = sky(vec3(0.95, 0.72, 0.32), vec3(0.8, 0.55, 0.18)) * (0.8 + 0.3 * smoothstep(1.0, -1.0, q.y));
    sheaf = over(sheaf, grain, solid(kernel) * (0.85 + 0.15 * hash(vec2(m, seed))));
  }
  float stalk = stroke(local.y - hs.y - 1.0, 0.4);
  vec4 stem = vec4(sky(vec3(0.7, 0.5, 0.22), vec3(0.6, 0.4, 0.14)), 1.0) * stalk;
  sheaf = layer(stem, sheaf);
  c = c * (1.0 - sheaf.a * woven) + sheaf * woven * step(abs(local.x), hs.x - 5.0);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = rotate(p, seed * 6.2832 + t * (seed - 0.5) * 2.0);
  float a = atan(q.x, q.y);
  float leaf = length(q) - 0.42 - 0.38 * pow(abs(cos(a * 2.5)), 3.0) * smoothstep(-1.0, 0.0, cos(a));
  leaf = min(leaf, sdBox(q - vec2(0.0, -0.45), vec2(0.05, 0.42)));
  vec3 color = kind < 0.5 ? vec3(0.78, 0.28, 0.1) : kind < 1.5 ? vec3(0.92, 0.58, 0.14) : vec3(0.62, 0.5, 0.16);
  color *= sky(vec3(1.0), vec3(0.9));
  color = mix(color, color * 0.7, solid(abs(q.x) - 0.03) * step(q.y, 0.6));
  float m = solid(leaf) * alpha;
  return vec4(color * m, m);
}`,
  behavior: rise({ rate: 0.45, speed: [-44, -22], wobble: 22, size: [9, 13], life: [1.4, 2.4], variants: 3 }),
}
