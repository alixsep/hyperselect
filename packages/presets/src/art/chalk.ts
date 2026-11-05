import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { studio, tone } from './shared'

export const chalk: Preset = {
  name: 'chalk',
  pad: [20, 14, 22],
  tint: [0.92, 0.86, 0.6],
  selection: { dark: 'color:#fffdf2;text-shadow:0 1px 2px rgb(0 0 0 / .6)', light: 'color:#10203a' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  vec2 s = rotate(world, 1.05);
  float lane = floor(s.y / 6.0);
  float pressure = 0.4 + 0.35 * hash(vec2(lane, seed)) + 0.2 * noise(vec2(s.x * 0.05, lane));
  float ragged = d + (noise(world * 0.15 + seed) - 0.5) * 5.0 + (hash(vec2(lane, seed + 4.0)) - 0.5) * 6.0;
  float grit = tooth(world * 0.9);
  float dust = smoothstep(1.0 - pressure, 1.15 - pressure, grit);
  float lanes = mix(0.55, 1.0, smoothstep(0.5, 0.35, abs(fract(s.y / 6.0) - 0.5)));
  float drawn = sweep(local.x + hash(vec2(lane, seed + 9.0)) * 20.0, hs, age, 1000.0, 12.0);
  vec3 color = sky(vec3(0.92, 0.88, 0.62), vec3(0.36, 0.56, 0.86));
  float strength = mix(0.34, 0.48, uLight);
  vec4 c = vec4(color, 1.0) * solid(ragged) * drawn * strength * 0.18;
  c = over(c, color, dust * lanes * solid(ragged) * drawn * strength);
  float underline = stroke(local.y - hs.y - 5.0 + (noise(vec2(world.x * 0.02, seed)) - 0.5) * 3.0, 1.1) * step(abs(local.x), hs.x + 3.0);
  c = over(c, color, underline * smoothstep(0.3, 0.55, grit) * sweep(local.x, hs, age - 0.15, 1300.0, 10.0) * mix(0.75, 0.85, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float speck = exp(-dot(p, p) * 5.0);
  vec3 color = sky(vec3(0.95, 0.92, 0.7), vec3(0.4, 0.58, 0.88));
  return vec4(color * speck * alpha, speck * alpha * 0.8);
}`,
  behavior: rise({ rate: 1.6, speed: [-30, -12], wobble: 6, size: [3, 6], life: [0.8, 1.6] }),
}
