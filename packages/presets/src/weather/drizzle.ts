import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const drizzle: Preset = {
  name: 'drizzle',
  pad: [22, 46, 18],
  tint: [0.58, 0.7, 0.8],
  selection: { dark: 'color:#f1f4f7', light: 'color:#1c242c' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 8.0) + (fbm3(world * 0.04 + seed * 9.0) - 0.5) * 8.0;
  if (fade < 0.001 || d > 46.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.5, age);
  float mist = fbm3(vec2(world.x * 0.018 - t * 0.12, world.y * 0.05) + seed * 4.0);
  float body = (1.0 - smoothstep(-6.0, 10.0, d)) * open;
  vec3 veil = sky(vec3(0.16, 0.2, 0.25), vec3(0.76, 0.82, 0.87)) + sky(vec3(0.08, 0.09, 0.1), vec3(0.06, 0.05, 0.03)) * mist;
  vec4 c = vec4(veil, 1.0) * body * mix(0.55, 0.85, mist);
  float fine = rain(world - vec2(world.y * 0.05, 0.0), t, vec2(4.0, 26.0), 240.0, 8.0, 0.18, 0.55, seed);
  float finer = rain(world + vec2(seed * 31.0, 0.0), t, vec2(3.0, 18.0), 170.0, 5.0, 0.12, 0.5, seed + 2.0);
  float air = solid(d - 40.0) * open;
  c = over(c, sky(vec3(0.72, 0.8, 0.88), vec3(0.4, 0.5, 0.6)), (fine * 0.45 + finer * 0.25) * air);
  vec2 g = world / 4.5 + seed * 13.0;
  vec2 id = floor(g);
  vec2 q = fract(g) - 0.5 - (hash2(id) - 0.5) * 0.4;
  float r = (0.08 + 0.12 * hash(id + 2.0)) * step(0.55, hash(id + 5.0)) * smoothstep(0.0, 1.5, age - hash(id + 7.0));
  float bead = solid((length(q) - r) * 4.5) * body;
  c = over(c, sky(vec3(0.82, 0.88, 0.94), vec3(0.98, 0.99, 1.0)), bead * smoothstep(-r, r, q.y) * 0.55);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.76, 0.84, 0.92], [0.36, 0.46, 0.56]),
  behavior: rainfall({ density: 12, speed: 300, slant: 0.04, length: 8, splash: 0 }),
}
