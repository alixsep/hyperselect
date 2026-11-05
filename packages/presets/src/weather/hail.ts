import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const hail: Preset = {
  name: 'hail',
  pad: [22, 60, 16],
  tint: [0.56, 0.72, 0.64],
  selection: { dark: 'color:#f1f8f4', light: 'color:#15211b' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 60.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.4, age);
  float body = solid(d) * open;
  float eerie = fbm3(vec2(world.x * 0.015 - t * 0.2, world.y * 0.05) + seed * 4.0);
  vec3 supercell = sky(mix(vec3(0.05, 0.1, 0.09), vec3(0.12, 0.2, 0.17), eerie), mix(vec3(0.74, 0.82, 0.78), vec3(0.84, 0.9, 0.86), eerie));
  vec4 c = vec4(supercell, 1.0) * body * 0.92;
  float drops = rain(world - vec2(world.y * 0.06, 0.0), t, vec2(8.0, 50.0), 680.0, 18.0, 0.3, 0.35, seed);
  c = over(c, sky(vec3(0.6, 0.76, 0.7), vec3(0.3, 0.44, 0.38)), drops * open * solid(d - 52.0) * mix(0.3, 0.7, 1.0 - body));
  float cellW = 5.5;
  float id = floor(world.x / cellW);
  float h = hash(vec2(id, seed));
  float layer = smoothstep(0.3, 6.0, age);
  float r = (1.4 + 1.2 * h) * step(h, layer * 0.9 + 0.05);
  vec2 q = vec2(mod(world.x, cellW) - cellW * 0.5 + (hash(vec2(id, 3.0)) - 0.5) * 2.0, local.y - hs.y + r + 0.5);
  float stone = solid(length(q) - r) * step(abs(local.x), hs.x - 2.0);
  float lit = smoothstep(r, -r, q.y + q.x * 0.6);
  c = over(c, mix(sky(vec3(0.55, 0.66, 0.7), vec3(0.62, 0.72, 0.76)), vec3(0.97, 1.0, 1.0), lit), stone * open);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.66, 0.8, 0.74], [0.3, 0.44, 0.38], [0.95, 0.99, 0.98]),
  behavior: rainfall({ density: 7, speed: 820, slant: 0.05, length: 18, splash: 1, pellets: 0.7 }),
}
