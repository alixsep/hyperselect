import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const wormhole: Preset = {
  name: 'wormhole',
  pad: [14, 10, 10],
  tint: [0.3, 0.84, 0.8],
  selection: {
    dark: 'color:#effffd;text-shadow:0 0 4px rgb(2 14 18 / .9)',
    light: 'color:#effffd;text-shadow:0 0 4px rgb(2 14 18 / .9)',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 7.0, cover);
  vec2 q = local * vec2(0.45, 1.0);
  float r = length(q);
  float far = 0.45 * hs.x + 12.0;
  float iris = easeOut(age * 2.2) * (far + 20.0) * (0.25 + 0.75 * fade);
  float inside = solid(max(d, r - iris));
  float phase = log(max(r, 1.0) / far) * 4.0 + t * 0.8;
  float aa = fwidth(phase);
  if (inside <= 0.0) return vec4(0.0);
  float depth = clamp(r / far, 0.0, 1.0);
  float theta = atan(q.y, q.x) + log(max(r, 1.0)) * 2.2 - t * 0.4;
  float swirl = fbm3(vec2(cos(theta), sin(theta)) * 1.6 + vec2(phase * 0.2, seed * 7.0));
  float arms = smoothstep(0.2, 0.9, 0.5 + 0.5 * cos(theta * 2.0 + swirl * 2.0));
  float ring = smoothstep(aa * 1.5 + 0.03, 0.0, abs(fract(phase) - 0.5) - 0.46);
  float throat = exp(-r / 7.0);
  vec3 deep = vec3(0.006, 0.014, 0.04), teal = vec3(0.16, 0.78, 0.74), violet = vec3(0.4, 0.26, 0.9), pale = vec3(0.86, 1.0, 0.98);
  float wall = depth * depth * (0.35 + 0.65 * arms);
  vec3 rgb = deep + mix(violet, teal, depth * 0.6 + swirl * 0.4) * wall * 0.6;
  rgb += mix(violet, teal, depth) * ring * depth * 0.45;
  rgb += pale * throat * 0.6 + teal * exp(-r / 22.0) * 0.12;
  rgb += pale * smoothstep(3.0, 0.0, abs(r - iris)) * (1.0 - smoothstep(0.0, 0.6, age)) * 0.8;
  vec4 s = starCell(world, 15.0, seed);
  rgb += pale * step(0.7, s.z) * point(s.xy, 0.3) * 0.6 * (1.0 - depth);
  float a = mix(0.9, 0.98, uLight) * inside;
  return sealed(rgb * inside, a) * fade;
}`,
}
