import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const caustics: Preset = {
  name: 'caustics',
  pad: [10, 8, 10],
  tint: [0.3, 0.88, 0.92],
  selection: { dark: 'color:#f2fffe;text-shadow:0 1px 2px rgb(0 25 30 / .9)', light: 'color:#022a30' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (d > 8.0) return vec4(0.0);
  float inside = smoothstep(1.5, -1.5, d);
  float focus = easeOut(age * 1.4);
  vec2 q = world / 40.0 + seed * 9.0;
  vec2 warp = vec2(fbm3(q * 0.7 + vec2(t * 0.22, -t * 0.15)), fbm3(q * 0.7 + vec2(4.7, 1.9) - vec2(t * 0.17, t * 0.2)));
  vec3 v = voronoi(q + (warp - 0.5) * 2.4);
  float edge = (v.y - v.x) / (0.6 + v.x);
  float strength = 0.5 + 0.5 * fbm3(q * 0.45 - t * 0.12);
  float lines = (exp(-edge * mix(5.0, 20.0, focus)) + smoothstep(0.05, 0.0, edge) * 0.6 * focus) * strength * smoothstep(0.0, 0.3, age);
  float depth = 0.85 + 0.15 * smoothstep(hs.y, -hs.y, local.y);
  float rim = exp(-max(d, 0.0) / 3.0) * (1.0 - inside);
  if (uLight > 0.5) {
    vec4 c = vec4(mix(vec3(0.36, 0.7, 0.8), vec3(0.5, 0.8, 0.86), depth - 0.85), 1.0) * inside * 0.88 * smoothstep(0.0, 0.2, age);
    c = over(c, vec3(0.94, 1.0, 1.0), clamp(lines * 1.1, 0.0, 1.0) * inside);
    c = over(c, vec3(0.5, 0.8, 0.86), rim * 0.4);
    return c * fade;
  }
  vec3 base = mix(vec3(0.0, 0.1, 0.14), vec3(0.01, 0.2, 0.25), depth - 0.85) * smoothstep(0.0, 0.2, age);
  vec3 light = mix(vec3(0.3, 0.9, 0.95), vec3(0.95, 1.0, 1.0), clamp(lines, 0.0, 1.0));
  vec3 rgb = base * inside + light * lines * inside * 1.05 + vec3(0.2, 0.7, 0.8) * rim * 0.25;
  return vec4(rgb * fade, inside * 0.82 * fade);
}`,
}
