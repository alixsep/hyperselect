import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { studio, tone } from './shared'

export const charcoal: Preset = {
  name: 'charcoal',
  pad: [22, 16, 20],
  tint: [0.6, 0.59, 0.57],
  selection: { dark: 'color:#f8f7f5', light: 'color:#111112' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 20.0) return vec4(0.0);
  float streak = fbm(vec2(world.x * 0.006, world.y * 0.22) + seed * 5.0);
  float smear = smoothstep(6.0, -5.0, d + (streak - 0.5) * 10.0);
  float drag = noise(vec2(world.x * 0.004, world.y * 0.6) + seed);
  float grit = tooth(world * 1.1);
  float dense = smear * (0.55 + 0.45 * smoothstep(0.3, 0.8, drag)) * (0.72 + 0.28 * grit);
  float rubbed = sweep(local.x, hs, age, 900.0, 30.0);
  vec3 color = sky(vec3(0.42, 0.41, 0.4), vec3(0.33, 0.32, 0.31));
  vec4 c = vec4(color, 1.0) * dense * rubbed * mix(0.62, 0.34, uLight);
  float contour = stroke(local.y - hs.y - 1.0 + (noise(vec2(world.x * 0.02, seed)) - 0.5) * 3.0, 1.2) * step(abs(local.x), hs.x + 4.0);
  c = over(c, sky(vec3(0.62, 0.61, 0.6), vec3(0.16, 0.16, 0.16)), contour * smoothstep(0.35, 0.55, grit) * sweep(local.x, hs, age - 0.2, 1200.0, 8.0) * 0.85);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float speck = solid(length(p + (vec2(hash(vec2(seed, 1.0)), hash(vec2(seed, 2.0))) - 0.5) * 0.4) - 0.45);
  vec3 color = sky(vec3(0.62, 0.61, 0.6), vec3(0.18, 0.18, 0.18));
  return vec4(color * speck * alpha, speck * alpha * 0.8);
}`,
  behavior: rise({ rate: 1.2, speed: [-40, -18], wobble: 3, size: [2, 4], life: [0.7, 1.3] }),
}
