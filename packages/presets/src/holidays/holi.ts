import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

const powder = /* glsl */ `
vec3 powder(float h) {
  vec3 c = h < 0.17 ? vec3(0.95, 0.2, 0.55) : h < 0.34 ? vec3(1.0, 0.6, 0.1) : h < 0.5 ? vec3(1.0, 0.84, 0.2) : h < 0.67 ? vec3(0.2, 0.74, 0.36) : h < 0.84 ? vec3(0.2, 0.46, 0.95) : vec3(0.58, 0.3, 0.9);
  return c * mix(1.0, 0.92, uLight);
}
`

export const holi: Preset = {
  name: 'holi',
  pad: [26, 22, 22],
  tint: [0.95, 0.3, 0.6],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 3px rgb(20 0 20 / .8)', light: 'color:#1e0a1e' },
  surface: /* glsl */ `${festive}${powder}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 7.0);
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.09, 0.07, 0.11), vec3(1.0, 0.98, 0.96)), 1.0) * body * 0.92;
  float rough = fbm(world * 0.08 + seed * 6.0);
  float grain = hash(floor(world * 1.3));
  float spread = smoothstep(0.0, 0.7, age);
  for (int i = -1; i <= 1; i++) {
    float k = floor(world.x / 34.0) + float(i);
    float h = hash(vec2(k, seed));
    vec2 center = vec2((k + 0.5) * 34.0 + (hash(vec2(k, seed + 3.0)) - 0.5) * 16.0 - world.x + local.x, (h < 0.5 ? -1.0 : 1.0) * (hs.y + 3.0));
    vec2 p = local - center;
    float cloud = length(p * vec2(0.55, 1.0)) - mix(6.0, 10.0, fract(h * 7.3)) * spread + (rough - 0.5) * 9.0;
    float dust = smoothstep(2.0, -4.0, cloud) * (0.4 + 0.6 * grain) * step(abs(center.x), hs.x - 4.0);
    c = over(c, powder(fract(h * 13.7)), dust * 0.9);
  }
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}${powder}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float puff = exp(-dot(p, p) * 3.2) * (0.6 + 0.4 * noise(p * 5.0 + seed * 30.0));
  float speck = step(0.55, hash(floor(p * 7.0) + seed)) * exp(-dot(p, p) * 1.6);
  float a = clamp(puff * 1.2 + speck * 0.4, 0.0, 1.0) * alpha * 0.85;
  return vec4(powder(seed) * a, a);
}`,
  behavior: toss({ burst: 10, rate: 1.0, speed: [70, 170], spread: 1.3, gravity: 50, drag: 3.2, size: [10, 18], life: [0.8, 1.4] }),
}
