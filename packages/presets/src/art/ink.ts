import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const ink: Preset = {
  name: 'ink',
  pad: [30, 12, 12],
  tint: [0.55, 0.56, 0.62],
  selection: { dark: 'color:#f6f6f8', light: 'color:#141518' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 26.0 || abs(local.y) > hs.y + 8.0) return vec4(0.0);
  float u = clamp((local.x + hs.x) / (2.0 * hs.x), 0.0, 1.0);
  float center = (noise(vec2(world.x * 0.008, seed * 7.0)) - 0.5) * 3.0;
  float width = hs.y * (1.12 - 0.22 * u) + (noise(vec2(world.x * 0.04, seed * 3.0)) - 0.5) * 2.5;
  float d = length(vec2(max(abs(local.x) - hs.x + width * 0.6, 0.0) * 1.6, local.y - center)) - width;
  float across = local.y - center;
  float bristle = noise(vec2(across * 0.8 + seed * 20.0, world.x * 0.006));
  float dryness = 0.08 + smoothstep(0.55, 1.0, u) * 0.6 + smoothstep(-4.0, 0.0, d) * 0.2;
  float loaded = smoothstep(dryness - 0.06, dryness + 0.06, bristle);
  float brush = age * 1100.0 - local.x - hs.x;
  float body = solid(d) * loaded * smoothstep(0.0, 10.0, brush);
  float streak = noise(vec2(across * 0.5, world.x * 0.01 + seed));
  vec3 wash = mix(sky(vec3(0.2, 0.21, 0.26), vec3(0.68, 0.69, 0.72)), sky(vec3(0.32, 0.33, 0.4), vec3(0.5, 0.51, 0.56)), streak);
  wash = mix(wash, sky(vec3(0.38, 0.39, 0.46), vec3(0.36, 0.37, 0.42)), smoothstep(-3.0, 0.0, d) * 0.6 + smoothstep(40.0, 0.0, brush) * 0.4);
  vec4 c = vec4(wash, 1.0) * body * 0.95;
  vec2 q = local - vec2(hs.x + 15.0, -2.0);
  float carved = min(min(sdBox(q - vec2(-1.6, 0.0), vec2(0.6, 3.0)), sdBox(q - vec2(1.6, 0.0), vec2(0.6, 3.0))), sdBox(q, vec2(3.0, 0.6)));
  float seal = solid(max(sdRBox(q, vec2(5.0), 1.0), -carved)) * step(0.35, tooth(world * 0.9));
  float stamped = smoothstep(2.0 * hs.x + 20.0, 2.0 * hs.x + 60.0, age * 1100.0) * (1.0 - cover) * step(40.0, hs.x);
  c = over(c, sky(vec3(0.85, 0.28, 0.22), vec3(0.78, 0.16, 0.12)), seal * stamped * 0.9);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
