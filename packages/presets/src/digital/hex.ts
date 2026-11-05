import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const hex: Preset = {
  name: 'hex',
  pad: [18, 14, 14],
  tint: [0.35, 0.75, 1],
  selection: { dark: 'color:#f0faff', light: 'color:#08203a' },
  surface: /* glsl */ `${screen}
vec4 honeycomb(vec2 p) {
  vec2 s = vec2(1.0, 1.7320508);
  vec2 a = mod(p, s) - s * 0.5;
  vec2 b = mod(p - s * 0.5, s) - s * 0.5;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  return vec4(g, p - g);
}

float hexagon(vec2 p) {
  p = abs(p);
  return max(dot(p, vec2(0.5, 0.8660254)), p.x);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float scale = 7.0;
  vec4 h = honeycomb(world.yx / scale);
  vec2 id = h.zw;
  float r = hexagon(h.xy);
  float edge = 1.0 - smoothstep(0.42, 0.5, r);
  float wire = smoothstep(0.38, 0.47, r) * edge;
  float pop = smoothstep(0.0, 0.12, age * 1.6 - hash(id + seed) * 0.4);
  vec2 center = id.yx * scale;
  float origin = length(center - world + local - vec2(sin(t * 0.4 + seed * 5.0) * hs.x, 0.0));
  float wave = pow(0.5 + 0.5 * sin(origin * 0.12 - t * 3.2), 6.0);
  float spark = step(0.94, hash(id + floor(t * 1.5 + hash(id) * 3.0)));
  float body = solid(d) * pop;
  vec3 cell = sky(vec3(0.03, 0.07, 0.13), vec3(0.9, 0.95, 1.0));
  vec3 lit = sky(vec3(0.08, 0.2, 0.32), vec3(0.78, 0.89, 1.0));
  vec4 c = vec4(mix(cell, lit, max(wave * 0.7, spark)), 1.0) * body * edge * 0.94;
  c += vec4(sky(vec3(0.02, 0.04, 0.08), vec3(0.8, 0.88, 0.98)), 1.0) * body * (1.0 - edge) * 0.94;
  vec3 line = sky(vec3(0.3, 0.75, 1.0), vec3(0.2, 0.5, 0.9));
  c = over(c, line, wire * body * (0.3 + 0.6 * wave));
  c = over(c, line, stroke(d + 0.5, 0.45) * body * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
