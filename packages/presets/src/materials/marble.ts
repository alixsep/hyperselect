import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const marble: Preset = {
  name: 'marble',
  pad: [14, 10, 16],
  tint: [0.78, 0.74, 0.7],
  selection: { dark: 'color:#faf7f1;text-shadow:0 1px 2px rgb(0 0 0 / .8)', light: 'color:#1a1a1c' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = 2.0;
  float rise = easeOut(age * 2.5);
  vec2 p = local - vec2(0.0, 4.0 * (1.0 - rise));
  float d = sdRBox(p, hs, r);
  float inside = solid(d);
  float sh = drop(sdRBox(p - vec2(1.5, 4.0), hs, r), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * rise;
  float e = -d;
  vec2 q = world * 0.0055 + seed * 13.0;
  float warp = fbm(q * 1.3);
  float flow = sin((q.x * 0.8 + q.y * 1.9 + warp * 4.5) * 2.2);
  float draw = easeOut((age - 0.1) * 1.4);
  float width = 0.07 * draw * smoothstep(0.25, 0.7, noise(q * 1.4 + 4.0));
  float fa = fwidth(flow);
  float vein = smoothstep(width + fa, width - fa, abs(flow)) * step(0.001, width);
  float halo = smoothstep(0.5, 0.0, abs(flow)) * draw * smoothstep(0.2, 0.7, noise(q * 1.4 + 4.0));
  float ridge = abs(fbm(q * 2.6 + warp * 1.7) - 0.5);
  float fine = smoothstep(0.018 * draw + fwidth(ridge), 0.0, ridge) * smoothstep(0.45, 0.75, noise(q * 2.0 + 9.0));
  float cloud = fbm3(q * 5.0 + 2.0);
  vec3 base = mix(vec3(0.05, 0.05, 0.055) + vec3(0.06, 0.055, 0.05) * cloud, vec3(0.9, 0.9, 0.89) + vec3(0.06) * cloud, uLight);
  vec3 veinCol = mix(vec3(0.74, 0.71, 0.66), vec3(0.5, 0.52, 0.56), uLight);
  vec3 col = mix(base, veinCol, halo * 0.18);
  col = mix(col, veinCol, fine * 0.35);
  col = mix(col, veinCol, vein * 0.9);
  float refl = smoothstep(26.0, 18.0, abs(mod(p.x * 0.9 - p.y * 1.8 + seed * 300.0, 300.0) - 150.0));
  col += mix(0.05, 0.035, uLight) * refl;
  col *= 1.0 + mix(0.6, 0.06, uLight) * smoothstep(1.3, 0.0, abs(e - 1.3)) * step(p.y, 0.0);
  col *= 1.0 - mix(0.2, 0.25, uLight) * smoothstep(1.0, 0.0, e) * step(0.0, p.y);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * rise;
}`,
}
