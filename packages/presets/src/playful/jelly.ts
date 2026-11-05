import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const jelly: Preset = {
  name: 'jelly',
  pad: [24, 24, 18],
  tint: [0.95, 0.3, 0.45],
  selection: { dark: 'color:#fff3f5', light: 'color:#3a0814' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 24.0 || abs(local.y) > hs.y + 22.0) return vec4(0.0);
  float jiggle = exp(-age * 2.6) * 1.0 + 0.12;
  float wave = sin(t * 13.0 - local.x * 0.05) * jiggle;
  vec2 p = vec2(local.x * (1.0 - wave * 0.02), local.y + wave * (local.y + hs.y) * 0.18);
  p.x += sin(t * 9.0 + local.y * 0.2) * jiggle * (local.y + hs.y) * 0.08;
  float d = sdRBox(p, hs, min(hs.y, 10.0));
  float body = solid(d) * smoothstep(0.0, 0.12, age);
  float depth = smoothstep(-6.0, 0.0, d);
  vec3 core = sky(vec3(0.5, 0.04, 0.14), vec3(0.95, 0.32, 0.45));
  vec3 edge = sky(vec3(0.95, 0.25, 0.4), vec3(0.75, 0.08, 0.24));
  vec4 c = vec4(mix(core, edge, depth), 1.0) * body * mix(0.72, 0.82, uLight);
  float glow = smoothstep(0.0, -hs.y, d) * smoothstep(hs.y, -hs.y, p.y);
  c = over(c, sky(vec3(1.0, 0.45, 0.55), vec3(1.0, 0.7, 0.75)), glow * body * 0.35);
  vec2 sp = p - vec2(-hs.x * 0.6, -hs.y * 0.55);
  float spec = exp(-pow(sp.y / 1.6, 2.0)) * smoothstep(hs.x * 0.5, 0.0, abs(sp.x)) + exp(-dot(p - vec2(hs.x - 7.0, -hs.y + 4.0), p - vec2(hs.x - 7.0, -hs.y + 4.0)) / 3.0);
  c = over(c, vec3(1.0), spec * body * 0.75);
  vec2 g = (p + vec2(0.0, t * 3.0)) / 9.0 + seed * 7.0;
  vec2 id = floor(g);
  vec2 q = (fract(g) - 0.5 - (hash2(id) - 0.5) * 0.5) * 9.0;
  float r = 0.6 + hash(id + 3.0) * 1.0;
  float bead = smoothstep(r, r - 0.6, length(q)) * step(0.72, hash(id + 5.0)) * smoothstep(-1.0, -3.0, d);
  c = over(c, sky(vec3(1.0, 0.6, 0.65), vec3(1.0, 0.85, 0.85)), bead * body * 0.6);
  float shadow = exp(-max(sdRBox(local - vec2(0.0, 3.0), hs, 10.0), 0.0) / 4.0) * (1.0 - body) * step(0.0, local.y);
  c += vec4(sky(vec3(0.3, 0.02, 0.08), vec3(0.0)), sky(vec3(0.0), vec3(0.18))) * shadow * 0.5;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
