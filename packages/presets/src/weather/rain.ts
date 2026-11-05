import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const rain: Preset = {
  name: 'rain',
  pad: [20, 70, 22],
  tint: [0.3, 0.62, 0.86],
  selection: { dark: 'color:#eef5fb', light: 'color:#14202c' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 70.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.35, age);
  float body = solid(d) * open;
  float aura = exp(-max(d, 0.0) / 9.0) * (1.0 - solid(d)) * open;
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec3 glass = sky(mix(vec3(0.07, 0.15, 0.25), vec3(0.04, 0.09, 0.16), depth), mix(vec3(0.84, 0.9, 0.96), vec3(0.74, 0.83, 0.92), depth));
  vec4 c = vec4(glass, 1.0) * body * 0.9 + vec4(sky(vec3(0.05, 0.12, 0.2), vec3(0.6, 0.74, 0.86)), 1.0) * aura * 0.25;
  float far = rain(world + vec2(0.0, seed * 50.0), t, vec2(5.0, 40.0), 380.0, 14.0, 0.25, 0.5, seed);
  float near = rain(world - vec2(world.y * 0.08, 0.0), t, vec2(9.0, 70.0), 620.0, 22.0, 0.45, 0.45, seed + 3.0);
  float air = solid(d - 60.0) * mix(0.35, 1.0, 1.0 - body);
  c = over(c, sky(vec3(0.45, 0.62, 0.8), vec3(0.42, 0.56, 0.7)), far * air * 0.35 * open);
  c = over(c, sky(vec3(0.66, 0.82, 0.97), vec3(0.24, 0.42, 0.62)), near * air * 0.6 * open);
  vec2 g = world / 8.0 + seed * 17.0;
  vec2 id = floor(g);
  vec2 q = fract(g) - 0.5 - (hash2(id) - 0.5) * 0.45;
  float h = hash(id + 4.0);
  float cycle = fract(t * 0.07 + h * 7.0);
  float r = (0.1 + 0.2 * h * h) * smoothstep(0.0, 0.15, cycle) * smoothstep(1.0, 0.8, cycle) * step(0.42, hash(id + 9.0));
  float bead = solid((length(q) - r) * 8.0) * body;
  float caustic = smoothstep(0.0, r, q.y) * smoothstep(r, r * 0.55, length(q));
  float spec = exp(-dot(q + r * vec2(0.4, 0.45), q + r * vec2(0.4, 0.45)) / max(r * r * 0.06, 1e-4));
  c = over(c, sky(vec3(0.01, 0.03, 0.06), vec3(0.62, 0.72, 0.82)), bead * 0.5);
  c = over(c, sky(vec3(0.5, 0.72, 0.95), vec3(0.97, 0.99, 1.0)), bead * (caustic * 0.6 + spec));
  float shore = exp(-abs(local.y - hs.y) / 1.5) * body;
  c = over(c, sky(vec3(0.5, 0.7, 0.92), vec3(0.3, 0.48, 0.66)), shore * 0.45);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.62, 0.8, 0.98], [0.2, 0.38, 0.58]),
  behavior: rainfall({ density: 9, speed: 640, slant: 0.08, length: 18, splash: 3 }),
}
