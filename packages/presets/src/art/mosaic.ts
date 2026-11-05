import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const mosaic: Preset = {
  name: 'mosaic',
  pad: [18, 12, 12],
  tint: [0.35, 0.6, 0.85],
  selection: { dark: 'color:#f6faff;text-shadow:0 1px 2px rgb(0 10 30 / .6)', light: 'color:#0c1a2a' },
  surface: /* glsl */ `${studio}
vec4 tessera(vec2 p) {
  vec2 g = floor(p);
  vec2 best = vec2(0.0);
  float f1 = 9.0, f2 = 9.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = g + vec2(x, y);
      vec2 o = cell + 0.5 + (hash2(cell) - 0.5) * 0.6;
      vec2 r = abs(o - p);
      float dist = max(r.x, r.y);
      if (dist < f1) {
        f2 = f1;
        f1 = dist;
        best = o;
      } else if (dist < f2) {
        f2 = dist;
      }
    }
  }
  return vec4(best, f1, f2 - f1);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  if (fade < 0.001 || sdBox(local, hs) > 10.0) return vec4(0.0);
  vec2 offset = vec2(seed * 13.0, 0.0);
  vec4 tile = tessera(world / 8.0 + offset);
  vec2 center = local + (tile.xy - offset) * 8.0 - world;
  float h = hash(tile.xy);
  float placed = smoothstep(0.0, 0.15, age - h * 0.3 - (center.x + hs.x) / max(2.0 * hs.x, 1.0) * 0.35);
  float inside = step(sdBox(center, hs + 2.0), 0.0);
  float grout = smoothstep(0.05 + (1.0 - placed) * 0.4, 0.11 + (1.0 - placed) * 0.4, tile.w);
  float pick = hash(tile.xy + 3.0);
  vec3 color = pick < 0.35 ? sky(vec3(0.1, 0.22, 0.34), vec3(0.75, 0.86, 0.94)) : pick < 0.7 ? sky(vec3(0.14, 0.29, 0.42), vec3(0.82, 0.92, 0.96)) : pick < 0.93 ? sky(vec3(0.08, 0.17, 0.3), vec3(0.69, 0.8, 0.91)) : sky(vec3(0.55, 0.42, 0.16), vec3(0.95, 0.82, 0.5));
  vec2 within = (world - (tile.xy - offset) * 8.0) / 4.0;
  color *= 1.0 + dot(within, vec2(-0.6, -0.8)) * 0.06 + (hash(tile.xy + 7.0) - 0.5) * 0.08;
  float glint = step(0.93, pick) * pow(max(sin(t * 1.5 + h * 40.0), 0.0), 24.0) * smoothstep(0.6, 0.0, length(within + 0.3));
  vec4 c = vec4(sky(vec3(0.05, 0.05, 0.06), vec3(0.86, 0.85, 0.82)), 1.0) * inside * placed * 0.92;
  c = over(c, color + glint, grout * inside * placed);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
