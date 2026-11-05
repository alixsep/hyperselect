import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const popcorn: Preset = {
  name: 'popcorn',
  pad: [22, 40, 16],
  tint: [0.98, 0.8, 0.4],
  selection: { dark: 'color:#fff9ec', light: 'color:#2c1e06' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float stripe = step(0.5, fract(world.x / 26.0 + seed));
  vec3 box = sky(mix(vec3(0.3, 0.07, 0.08), vec3(0.22, 0.14, 0.1), stripe), mix(vec3(1.0, 0.88, 0.86), vec3(1.0, 0.97, 0.92), stripe));
  vec4 c = vec4(box, 1.0) * body * 0.92;
  c = over(c, sky(vec3(0.95, 0.75, 0.35), vec3(1.0, 0.85, 0.5)), exp(-abs(local.y + hs.y - 1.5) / 1.5) * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float popped = smoothstep(0.0, 0.03, life);
  float d = length(p) - 0.22 * (1.0 - popped);
  float shade = 0.0;
  for (int k = 0; k < 5; k++) {
    float fk = float(k);
    float a = fk * 1.257 + seed * 6.2832;
    vec2 c = vec2(cos(a), sin(a)) * (0.32 + 0.12 * fract(seed * 13.0 + fk * 0.37)) * popped;
    float r = (0.32 + 0.1 * fract(seed * 7.0 + fk * 0.61)) * popped;
    float lobe = length(p - c) - r;
    d = min(d, lobe);
    shade = max(shade, smoothstep(r, -r, length(p - c - vec2(-0.08, 0.1) * r)));
  }
  float body = solid(d);
  float hull = smoothstep(0.16, 0.06, length(p - vec2(0.05, -0.05)));
  vec3 cream = mix(vec3(0.92, 0.8, 0.55), vec3(1.0, 0.98, 0.9), shade);
  vec3 c = mix(cream, vec3(0.75, 0.45, 0.12), hull * 0.7);
  return vec4(c * body * alpha, body * alpha);
}`,
  behavior: toss({ burst: 0, rate: 7, speed: [260, 460], spread: 0.45, gravity: 1250, drag: 0.4, size: [10, 14], life: [1.6, 2.6], spin: 7, bounce: 0.28 }),
}
