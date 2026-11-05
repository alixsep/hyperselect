import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const stipple: Preset = {
  name: 'stipple',
  pad: [20, 14, 14],
  tint: [0.55, 0.62, 0.95],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(0 0 0 / .6)', light: 'color:#121420' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  vec2 g = floor(world / 3.6);
  vec2 o = (g + 0.5 + (hash2(g + seed) - 0.5) * 0.4) * 3.6;
  vec2 at = local + o - world;
  float h = hash(g + seed + 1.0);
  float edge = sdRBox(at, hs, 4.0) + (noise(o * 0.1 + seed) - 0.5) * 8.0;
  float present = step(h, 0.85 * smoothstep(4.0, -4.0, edge));
  float pop = smoothstep(0.0, 0.12, age - h * 0.25 - (at.x + hs.x) / max(2.0 * hs.x, 1.0) * 0.35);
  float r = (0.85 + 0.35 * hash(g + seed + 2.0)) * pop;
  float speck = solid(length(world - o) - r) * present;
  float pick = hash(g + seed + 7.0);
  vec3 color = pick < 0.45 ? sky(vec3(0.38, 0.45, 0.92), vec3(0.45, 0.55, 0.95)) : pick < 0.8 ? sky(vec3(0.92, 0.58, 0.28), vec3(0.98, 0.65, 0.35)) : sky(vec3(0.32, 0.78, 0.62), vec3(0.42, 0.78, 0.62));
  vec4 c = vec4(sky(vec3(0.1, 0.1, 0.15), vec3(0.97, 0.96, 0.93)), 1.0) * solid(d) * smoothstep(0.0, 0.2, age) * 0.88;
  c = over(c, color, speck * mix(0.5, 0.8, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
