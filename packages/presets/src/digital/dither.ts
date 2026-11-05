import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const dither: Preset = {
  name: 'dither',
  pad: [22, 16, 16],
  tint: [0.6, 0.6, 0.9],
  selection: { dark: 'color:#f6f4ff', light: 'color:#141230' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  vec2 cell = floor(world / 2.0);
  float threshold = bayer(cell);
  float edge = 1.0 - smoothstep(-3.0, 12.0, d);
  float reveal = smoothstep(0.0, 0.45, age);
  float present = step(threshold, edge * reveal * 1.02);
  vec2 lamp = vec2(sin(t * 0.6 + seed * 6.0) * hs.x * 0.8, -hs.y * 0.4 + cos(t * 0.9) * hs.y * 0.5);
  float light = 0.8 - 0.55 * length((local - lamp) / vec2(hs.x * 0.6 + 30.0, hs.y * 2.0 + 20.0));
  float ink = step(threshold, clamp(light, 0.0, 1.0));
  vec3 paper = sky(vec3(0.1, 0.1, 0.16), vec3(0.95, 0.94, 0.9));
  vec3 tone = sky(vec3(0.27, 0.25, 0.44), vec3(0.8, 0.8, 0.94));
  vec3 halo = sky(vec3(0.3, 0.28, 0.5), vec3(0.62, 0.62, 0.86));
  vec3 col = solid(d) > 0.5 ? mix(paper, tone, ink) : halo;
  vec4 c = vec4(col, 1.0) * present * mix(0.94, 0.9, step(0.5, -d));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
