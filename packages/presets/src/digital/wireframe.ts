import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const wireframe: Preset = {
  name: 'wireframe',
  pad: [16, 12, 12],
  tint: [0.35, 0.85, 0.95],
  selection: { dark: 'color:#effcff', light: 'color:#08222a' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.02, 0.05, 0.08), vec3(0.94, 0.97, 0.99)), 1.0) * body * 0.94;
  vec2 uv = world / 11.0 + seed * 9.0;
  float height = sin(uv.x * 0.55 + t * 1.1) * cos(uv.y * 0.8 - t * 0.7) + 0.5 * sin(uv.x * 0.23 - uv.y * 0.4 + t * 0.6);
  vec2 mesh = uv + vec2(0.0, height * 0.45);
  float edges = max(lattice(mesh), lattice(vec2(mesh.x + mesh.y, 0.5)));
  float lift = 0.5 + 0.5 * height / 1.5;
  float sweep = smoothstep(0.0, 1.0, age * 1.4 - (local.x + hs.x) / max(hs.x * 2.0, 1.0) * 0.5);
  vec3 wire = sky(vec3(0.3, 0.85, 1.0), vec3(0.1, 0.45, 0.7));
  c = over(c, wire, edges * body * sweep * mix(0.15, 0.6, lift));
  vec2 vertex = (fract(mesh + 0.5) - 0.5) * 11.0;
  c = over(c, sky(vec3(0.8, 1.0, 1.0), vec3(0.05, 0.35, 0.6)), solid(length(vertex) - 0.9) * body * sweep * lift * 0.8);
  c = over(c, wire, stroke(d + 0.5, 0.45) * body * 0.6);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
