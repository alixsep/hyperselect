import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'
import { twinkle } from './sparkle'

export const glitter: Preset = {
  name: 'glitter',
  pad: [18, 22, 18],
  tint: [0.95, 0.74, 0.4],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 3px rgb(40 20 0 / .8)', light: 'color:#2a1c06;text-shadow:0 0 6px rgb(255 250 235 / .9)' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 22.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float blend = smoothstep(0.25, 0.75, noise(world * 0.015 + seed));
  vec3 ground = sky(mix(vec3(0.2, 0.12, 0.05), vec3(0.22, 0.08, 0.14), blend), mix(vec3(0.99, 0.94, 0.84), vec3(0.99, 0.9, 0.9), blend));
  vec4 c = vec4(ground, 1.0) * body * 0.92;
  vec3 v = voronoi(world * 0.55 + seed * 7.0);
  float speck = smoothstep(0.32, 0.18, v.x);
  float sweep = exp(-pow((local.x - local.y * 0.5 - mod(t * 120.0 + seed * 300.0, hs.x * 2.0 + 160.0) + hs.x + 80.0) / 40.0, 2.0));
  float angle = v.z * 6.2832 - t * (0.8 + v.z);
  float flash = pow(max(cos(angle), 0.0), 30.0) + sweep * pow(max(cos(angle * 0.5), 0.0), 4.0);
  vec3 metal = mix(sky(vec3(0.85, 0.62, 0.28), vec3(0.8, 0.58, 0.2)), sky(vec3(0.95, 0.6, 0.7), vec3(0.88, 0.45, 0.55)), blend);
  c = over(c, metal * (0.7 + 0.3 * fract(v.z * 13.0)), speck * body * mix(0.35, 0.45, uLight));
  c = over(c, sky(vec3(1.0, 0.96, 0.85), vec3(1.0, 0.92, 0.7)), clamp(flash, 0.0, 1.0) * speck * body);
  c = over(c, sky(vec3(0.5, 0.36, 0.16), vec3(0.85, 0.66, 0.35)), stroke(d + 1.0, 0.5) * body * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
${twinkle}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float pulse = sin(life * 3.1416);
  float s = twinkle(mat2(0.921, -0.389, 0.389, 0.921) * p * 1.6 / max(pulse, 0.05), 10.0) * pulse;
  float a = clamp(s, 0.0, 1.0) * alpha;
  vec3 c = sky(vec3(1.0, 0.93, 0.75), vec3(0.85, 0.6, 0.2));
  return vec4(c * a * 1.3, a * uLight);
}`,
  behavior: rise({ rate: 4, speed: [4, 14], wobble: 4, size: [8, 18], life: [0.5, 1] }),
}
