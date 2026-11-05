import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const glass: Preset = {
  name: 'glass',
  pad: [16, 10, 18],
  tint: [0.56, 0.82, 0.78],
  selection: { dark: 'color:#f2fbfa', light: 'color:#0d2928' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 4.0);
  float r = 5.0;
  float form = easeOut(age * 3.0);
  vec2 p = local / (1.0 + 0.06 * (1.0 - form));
  float d = sdRBox(p, hs, r);
  float inside = solid(d);
  float sh = drop(sdRBox(p - vec2(2.0, 6.0), hs, r), 6.0) * (1.0 - inside) * mix(0.3, 0.1, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * form;
  float e = -d;
  vec2 n = outward(p, hs, r);
  float rim = smoothstep(4.5, 0.0, e);
  float lip = smoothstep(1.1, 0.0, abs(e - 1.1));
  float lit = dot(n, normalize(vec2(-0.5, -0.85)));
  float g = mod(p.x + p.y * 1.4 - t * 4.0 + seed * 260.0, 260.0);
  float ga = fwidth(g);
  float streaks = smoothstep(-ga, ga, g) * smoothstep(34.0 + ga, 34.0 - ga, g) * 0.6 + smoothstep(ga, -ga, abs(g - 44.0) - 2.0);
  float pass = exp(-abs(p.x + p.y * 1.4 + hs.x + 50.0 - age * 900.0) / 14.0);
  float depth = 0.8 + 0.4 * smoothstep(hs.y, -hs.y, p.y);
  vec4 c = vec4(0.0, 0.0, 0.0, sh);
  c = over(c, mix(vec3(0.62, 0.8, 0.8), vec3(0.88, 0.95, 0.95), uLight), inside * mix(0.12, 0.38, uLight) * depth);
  c = over(c, mix(vec3(0.3, 0.64, 0.57), vec3(0.42, 0.63, 0.6), uLight), inside * rim * rim * 0.55);
  c = over(c, vec3(1.0), inside * clamp(streaks * mix(0.13, 0.5, uLight) + pass * 0.45, 0.0, 1.0));
  c = over(c, vec3(1.0), inside * lip * clamp(lit, 0.0, 1.0) * 0.9);
  c = over(c, mix(vec3(0.04, 0.14, 0.13), vec3(0.24, 0.4, 0.38), uLight), inside * lip * clamp(-lit, 0.0, 1.0) * 0.7);
  return c * fade * form;
}`,
}
