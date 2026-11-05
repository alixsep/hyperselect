import type { Preset } from 'hyperselect'
import { atmosphere } from './shared'

export const hurricane: Preset = {
  name: 'hurricane',
  pad: [30, 34, 34],
  tint: [0.5, 0.7, 0.9],
  selection: { dark: 'color:#f2f7fd;text-shadow:0 0 8px rgb(8 20 40 / .9)', light: 'color:#0f1c2b;text-shadow:0 0 8px rgb(255 255 255 / .9)' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 34.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.8, age);
  vec2 eye = vec2((hash(vec2(seed, 1.0)) - 0.5) * hs.x * 0.8, 0.0);
  vec2 q = local - eye;
  float r = length(q);
  float twist = 2.6 * log(1.0 + r / 9.0) - t * 0.9;
  vec2 s = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * q;
  float arms = 0.5 + 0.5 * sin(2.0 * atan(s.y, s.x) + seed * 6.0);
  float detail = fbm(s * 0.07 + seed * 4.0);
  float density = smoothstep(0.35, 0.85, arms * 0.55 + detail * 0.75 - r * 0.0012);
  float wall = exp(-pow((r - 9.0) / 4.0, 2.0));
  float clear = smoothstep(4.5, 8.0, r);
  float reach = 1.0 - smoothstep(-10.0, 30.0, d + (0.5 - detail) * 24.0);
  float cloud = clamp(density * clear + wall * 0.9, 0.0, 1.0) * reach * open;
  vec3 ocean = sky(vec3(0.03, 0.09, 0.17), vec3(0.62, 0.76, 0.86));
  float sea = (1.0 - smoothstep(-2.0, 10.0, d)) * open;
  vec4 c = vec4(ocean + sky(vec3(0.02, 0.05, 0.07), vec3(0.05, 0.04, 0.02)) * fbm3(world * 0.05), 1.0) * sea * 0.9;
  float lit = clamp(fbm3(s * 0.12 - seed) * 1.6 - 0.3, 0.0, 1.0);
  vec3 tops = mix(sky(vec3(0.5, 0.6, 0.72), vec3(0.72, 0.78, 0.86)), sky(vec3(0.94, 0.97, 1.0), vec3(1.0)), lit);
  c = over(c, tops, cloud * 0.92);
  c = over(c, sky(vec3(0.02, 0.06, 0.12), vec3(0.42, 0.56, 0.7)), (1.0 - clear) * sea * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
