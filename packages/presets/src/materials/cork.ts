import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const cork: Preset = {
  name: 'cork',
  pad: [14, 10, 16],
  tint: [0.78, 0.52, 0.3],
  selection: { dark: 'color:#1a0c02', light: 'color:#1a0c02' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  if (sdRBox(local, hs, 3.0) > 8.0) return vec4(0.0);
  vec3 v = voronoi(world * 0.26 + seed * 17.0);
  float id = v.z;
  float sweep = (local.x + hs.x) / 2500.0;
  float delay = hash(vec2(id, 5.0)) * 0.2 + sweep;
  float settle = smoothstep(0.0, 0.12, age - delay);
  float stay = smoothstep(0.0, 0.15, fade - hash(vec2(id, 8.0)) * 0.7);
  float d = sdRBox(local, hs, 3.0) + (hash(vec2(id, 1.0)) - 0.5) * 2.5;
  float inside = solid(d) * settle * stay;
  float sh = drop(sdRBox(local - vec2(1.5, 3.5), hs, 3.0), 4.0) * (1.0 - inside) * mix(0.5, 0.16, uLight) * smoothstep(0.1, 0.3, age - sweep) * fade;
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh);
  float e = -d;
  float gap = smoothstep(0.02, 0.14, v.y - v.x);
  float tone = hash(vec2(id, 3.0));
  vec3 dark = mix(vec3(0.6, 0.39, 0.21), vec3(0.75, 0.57, 0.4), uLight);
  vec3 light = mix(vec3(0.84, 0.62, 0.38), vec3(0.92, 0.79, 0.62), uLight);
  vec3 col = mix(dark, light, tone * tone * 0.6 + 0.4 * tone);
  col = mix(col, dark * 0.62, step(0.95, hash(vec2(id, 7.0))));
  col *= 0.9 + 0.12 * noise(world * 1.1) + 0.14 * (fbm3(world * 0.03 + seed) - 0.5);
  col *= mix(0.74, 1.0, gap) * (0.9 + 0.1 * smoothstep(0.0, 0.4, v.x));
  col *= 1.0 - 0.3 * smoothstep(1.5, 0.0, e);
  vec4 c = vec4(col * inside, inside) * fade + vec4(0.0, 0.0, 0.0, sh);
  return c;
}`,
}
