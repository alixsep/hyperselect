import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const circuit: Preset = {
  name: 'circuit',
  pad: [16, 12, 16],
  tint: [0.35, 0.8, 0.55],
  selection: { dark: 'color:#f0fff6', light: 'color:#08261a' },
  surface: /* glsl */ `${screen}
float link(vec2 a, vec2 b, float seed) {
  return step(0.48, hash(a + b * 1.31 + seed));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  vec4 c = vec4(sky(vec3(0.02, 0.1, 0.07), vec3(0.86, 0.94, 0.88)), 1.0) * body * 0.94;
  float size = 8.0;
  vec2 cell = floor(world / size);
  vec2 q = world - (cell + 0.5) * size;
  float east = link(cell, cell + vec2(1.0, 0.0), seed);
  float west = link(cell - vec2(1.0, 0.0), cell, seed);
  float south = link(cell, cell + vec2(0.0, 1.0), seed + 3.0);
  float north = link(cell - vec2(0.0, 1.0), cell, seed + 3.0);
  float wire = 1e3;
  if (east > 0.5) wire = min(wire, max(abs(q.y), -q.x));
  if (west > 0.5) wire = min(wire, max(abs(q.y), q.x));
  if (south > 0.5) wire = min(wire, max(abs(q.x), -q.y));
  if (north > 0.5) wire = min(wire, max(abs(q.x), q.y));
  float links = east + west + south + north;
  float trace = solid(wire - 0.7) * step(0.5, links);
  float pad = step(links, 1.5) * step(0.5, links);
  float via = solid(length(q) - 1.9) * pad;
  float hole = solid(length(q) - 0.8) * pad;
  float flow = mod(dot(cell, vec2(1.0, 1.0)) * size - t * 70.0 + hash(vec2(cell.y, seed)) * 90.0, 140.0);
  float pulse = exp(-flow * 0.08) * step(0.0, flow);
  vec3 copper = sky(vec3(0.12, 0.38, 0.24), vec3(0.55, 0.78, 0.62));
  vec3 gold = sky(vec3(0.85, 0.66, 0.3), vec3(0.75, 0.55, 0.2));
  vec3 spark = sky(vec3(0.6, 1.0, 0.85), vec3(0.05, 0.6, 0.45));
  float inner = smoothstep(-2.0, -5.0, d);
  c = over(c, mix(copper, spark, pulse), trace * body * inner);
  c = over(c, gold, via * body * inner);
  c = over(c, sky(vec3(0.02, 0.08, 0.05), vec3(0.4, 0.5, 0.42)), hole * body * inner);
  float finger = solid(sdRBox(vec2(mod(local.x + hs.x, 6.0) - 3.0, local.y - hs.y + 2.6), vec2(1.7, 2.2), 0.8)) * step(abs(local.x), hs.x - 4.0);
  c = over(c, gold * (0.85 + 0.3 * smoothstep(2.0, -2.0, local.y - hs.y + 2.6)), finger * body);
  c = over(c, sky(vec3(0.35, 0.75, 0.5), vec3(0.3, 0.6, 0.42)), stroke(d + 0.5, 0.4) * body * 0.6);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
