import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const leather: Preset = {
  name: 'leather',
  pad: [14, 10, 18],
  tint: [0.6, 0.36, 0.2],
  selection: { dark: 'color:#fff3e4', light: 'color:#1f1006' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = 5.0;
  float press = easeOut(age * 2.8);
  vec2 p = local / (1.0 + 0.04 * (1.0 - press));
  float d = sdRBox(p, hs, r);
  float inside = solid(d);
  float lift = 2.0 + 5.0 * (1.0 - press);
  float sh = drop(sdRBox(p - vec2(1.5, lift), hs, r), 3.0 + lift) * (1.0 - inside) * mix(0.55, 0.18, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * press;
  float e = -d;
  vec3 v = voronoi(world * 0.13 + seed * 31.0);
  float crease = smoothstep(0.16, 0.0, v.y - v.x);
  float dome = 1.0 - smoothstep(0.0, 0.75, v.x);
  float groove = smoothstep(1.3, 0.0, abs(e - 4.5));
  float patina = fbm(world * 0.012 + seed * 5.0);
  float pore = noise(world * 0.9);
  vec3 hide = mix(vec3(0.36, 0.19, 0.09), vec3(0.74, 0.55, 0.39), uLight);
  vec3 col = hide * (0.84 + (0.14 * dome - 0.2 * crease) * press + 0.06 * (pore - 0.5)) * (0.78 + 0.44 * patina);
  col += mix(vec3(0.14, 0.09, 0.05), vec3(0.06, 0.05, 0.04), uLight) * smoothstep(hs.y, -hs.y * 0.3, p.y) * smoothstep(0.4, 0.75, patina) * dome;
  col *= mix(0.45, 1.0, smoothstep(0.0, 3.0, e));
  col *= 1.0 - 0.3 * groove;
  col *= 1.0 + 0.12 * smoothstep(1.0, 0.0, abs(e - 6.0)) * step(p.y, 0.0);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * press;
}`,
}
