import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const granite: Preset = {
  name: 'granite',
  pad: [14, 10, 16],
  tint: [0.72, 0.52, 0.5],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#111214;text-shadow:0 0 3px rgb(255 255 255 / .7)' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = 2.0;
  float show = easeOut(age * 4.0);
  float d = sdRBox(local, hs, r);
  float inside = solid(d);
  float sh = drop(sdRBox(local - vec2(1.5, 4.0), hs, r), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * show;
  float e = -d;
  vec3 v = voronoi(world * 0.3 + seed * 23.0);
  float cluster = fbm3(world * 0.05 + seed * 3.0);
  float pick = hash(vec2(v.z, 1.0)) * 0.75 + cluster * 0.5 + uLight * 0.2;
  vec3 black = mix(vec3(0.07, 0.07, 0.08), vec3(0.36, 0.36, 0.38), uLight);
  vec3 gray = mix(vec3(0.3, 0.3, 0.32), vec3(0.62, 0.62, 0.64), uLight);
  vec3 pink = mix(vec3(0.5, 0.3, 0.28), vec3(0.84, 0.68, 0.64), uLight);
  vec3 white = mix(vec3(0.62, 0.6, 0.58), vec3(0.94, 0.93, 0.91), uLight);
  vec3 col = black;
  col = mix(col, gray, step(0.42, pick));
  col = mix(col, pink, step(0.66, pick));
  col = mix(col, white, step(0.86, pick));
  col *= 0.88 + 0.24 * hash(vec2(v.z, 4.0));
  col *= 1.0 - 0.15 * smoothstep(0.05, 0.0, v.y - v.x);
  col = mix(mix(gray, pink, 0.4), col, mix(0.8, 0.62, uLight));
  float buff = smoothstep(-20.0, 20.0, -hs.x - 30.0 + age * 900.0 - local.x);
  col = mix(mix(col, vec3(mix(0.42, 0.8, uLight)), 0.3), col, buff);
  float g = mod(local.x * 0.8 - local.y * 2.2 + seed * 340.0 - t * 5.0, 340.0);
  float refl = smoothstep(0.0, 6.0, g) * smoothstep(70.0, 40.0, g);
  col += vec3(mix(0.12, 0.08, uLight)) * refl * buff;
  col *= 1.0 + 0.3 * smoothstep(1.2, 0.0, abs(e - 1.2)) * step(local.y, 0.0) * buff;
  col *= 1.0 - 0.4 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * show;
}`,
}
