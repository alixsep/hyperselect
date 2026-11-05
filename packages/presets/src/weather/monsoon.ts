import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const monsoon: Preset = {
  name: 'monsoon',
  pad: [24, 80, 24],
  tint: [0.22, 0.6, 0.58],
  selection: { dark: 'color:#ecfaf6', light: 'color:#0f2422' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 80.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.3, age);
  float body = solid(d) * open;
  float gust = smoothstep(0.3, 0.85, noise(vec2((world.x + world.y * 0.6) * 0.012 - t * 1.6, seed * 5.0)));
  vec3 deep = sky(vec3(0.03, 0.13, 0.13), vec3(0.72, 0.85, 0.82));
  vec4 c = vec4(deep + sky(vec3(0.04, 0.07, 0.07), vec3(-0.06, -0.04, -0.04)) * gust, 1.0) * body * 0.92;
  vec2 sheet = world - vec2(world.y * 0.32, 0.0);
  float a = rain(sheet, t, vec2(6.0, 46.0), 720.0, 26.0, 0.35, mix(0.35, 0.9, gust), seed);
  float b = rain(sheet * 1.4 + 40.0, t, vec2(5.0, 36.0), 560.0, 16.0, 0.2, mix(0.2, 0.8, gust), seed + 4.0);
  float air = solid(d - 72.0) * open;
  c = over(c, sky(vec3(0.52, 0.8, 0.76), vec3(0.18, 0.4, 0.38)), (a * 0.7 + b * 0.35) * air * mix(0.6, 1.0, 1.0 - body));
  float level = hs.y - 1.0 - smoothstep(0.0, 4.0, age) * 4.0;
  float wave = sin(world.x * 0.09 - t * 3.1) * 0.8 + sin(world.x * 0.21 + t * 4.3 + seed * 9.0) * 0.45;
  float surfaceLine = local.y - level - wave;
  float water = solid(-surfaceLine) * body;
  float shimmer = pow(noise(vec2(world.x * 0.15 - t * 2.0, (local.y - level) * 0.5)), 3.0);
  c = over(c, sky(vec3(0.02, 0.09, 0.1), vec3(0.55, 0.72, 0.7)), water * 0.6);
  c = over(c, sky(vec3(0.3, 0.6, 0.56), vec3(0.95, 1.0, 0.98)), water * shimmer * 0.5);
  c = over(c, sky(vec3(0.6, 0.9, 0.84), vec3(0.2, 0.42, 0.4)), stroke(surfaceLine, 0.4) * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.58, 0.88, 0.82], [0.14, 0.36, 0.34]),
  behavior: rainfall({ density: 22, speed: 900, slant: 0.32, length: 26, splash: 4 }),
}
