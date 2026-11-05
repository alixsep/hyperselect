import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const woodcut: Preset = {
  name: 'woodcut',
  pad: [20, 14, 14],
  tint: [0.85, 0.6, 0.4],
  selection: { dark: 'color:#fff8f0', light: 'color:#24140a' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs) + (noise(world * 0.3) - 0.5) * 1.2;
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float grainY = world.y + (fbm(vec2(world.x * 0.006, world.y * 0.02) + seed) - 0.5) * 14.0;
  float lane = floor(grainY / 4.2);
  float across = abs(fract(grainY / 4.2) - 0.5) * 4.2;
  float gouge = max(noise(vec2(world.x * 0.015, lane + seed * 7.0)) - 0.45, 0.0) * 3.2;
  float carved = 1.0 - smoothstep(gouge - 0.5, gouge + 0.5, across);
  float pressed = smoothstep(0.0, 0.35, age);
  float inked = smoothstep(0.55 - pressed * 0.4, 0.7 - pressed * 0.4, tooth(world * 0.8));
  vec3 block = sky(vec3(0.38, 0.19, 0.1), vec3(0.95, 0.8, 0.6));
  vec3 paper = sky(vec3(0.2, 0.15, 0.12), vec3(0.99, 0.96, 0.9));
  vec4 c = vec4(mix(block, paper, carved * 0.85), 1.0) * solid(d) * pressed * mix(0.8, 1.0, inked);
  float frame = stroke(d + 1.6, 0.9) * step(0.3, tooth(world * 1.1));
  c = over(c, sky(vec3(0.82, 0.68, 0.5), vec3(0.18, 0.1, 0.06)), frame * pressed * 0.9);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
