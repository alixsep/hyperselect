import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const copper: Preset = {
  name: 'copper',
  pad: [14, 10, 16],
  tint: [0.86, 0.47, 0.3],
  selection: { dark: 'color:#fff6f0;text-shadow:0 1px 2px rgb(40 10 0 / .7)', light: 'color:#2a0f05' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = 4.0;
  float show = easeOut(age * 3.5);
  float d = sdRBox(local, hs, r);
  float inside = solid(d);
  float sh = drop(sdRBox(local - vec2(1.5, 4.0), hs, r), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * show;
  float e = -d;
  vec3 v = voronoi(world * 0.085 + seed * 19.0);
  float dimple = smoothstep(0.05, 0.6, v.x);
  float ridge = smoothstep(0.22, 0.0, v.y - v.x);
  float sway = fbm3(vec2(world.x * 0.006 + t * 0.02, world.y * 0.03) + seed * 4.0);
  float glint = exp(-abs(local.x + local.y * 0.8 + hs.x + 40.0 - age * 800.0) / 16.0);
  float tone = 0.25 + 0.3 * dimple + 0.25 * ridge + 0.35 * smoothstep(0.45, 0.75, sway) + 0.12 * smoothstep(hs.y, -hs.y, local.y);
  vec3 metal = mix(vec3(0.3, 0.12, 0.06), vec3(0.78, 0.42, 0.25), tone);
  metal = mix(metal, mix(vec3(0.8, 0.52, 0.4), vec3(0.95, 0.7, 0.58), tone), uLight * 0.7);
  float tarnish = fbm(world * 0.018 + seed * 5.0);
  metal *= mix(1.0, mix(0.6, 0.85, uLight), smoothstep(0.45, 0.7, tarnish));
  metal += vec3(1.0, 0.78, 0.6) * (ridge * smoothstep(0.5, 0.8, sway) * 0.25 + glint * 0.5);
  float creep = easeOut((age - 0.3) * 0.7);
  float grain = noise(world * 0.8 + 3.0);
  float crust = fbm(world * 0.035 + seed * 9.0) + smoothstep(9.0, 0.0, e) * 0.3 + (grain - 0.5) * 0.12;
  float patina = smoothstep(0.0, 0.06, crust - 1.25 + creep * 0.6);
  vec3 verdigris = mix(vec3(0.27, 0.55, 0.47), vec3(0.58, 0.78, 0.7), uLight) * (0.85 + 0.3 * grain);
  vec3 col = mix(metal, verdigris, patina * 0.92);
  col *= 1.0 + 0.3 * smoothstep(1.3, 0.0, abs(e - 1.2)) * step(local.y, 0.0) * (1.0 - patina);
  col *= 1.0 - 0.4 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * show;
}`,
}
