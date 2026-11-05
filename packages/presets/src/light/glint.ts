import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const glint: Preset = {
  name: 'glint',
  pad: [16, 14, 14],
  tint: [1.0, 0.84, 0.48],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(20 14 0 / .8)', light: 'color:#2e2410' },
  surface: /* glsl */ `${optics}
float star(vec2 q) {
  vec2 a = abs(q);
  return exp(-a.y * 1.3 - a.x * 0.22) + exp(-a.x * 1.3 - a.y * 0.22) + exp(-dot(q, q) * 0.3) * 1.2;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (d > 14.0) return vec4(0.0);
  float inside = solid(d);
  float shown = smoothstep(0.0, 0.2, age);
  float travel = 2.0 * hs.x + 140.0;
  float pos = -hs.x - 70.0 + mod(age - (world.y - local.y) * 0.0008, 3.4) * 1300.0;
  float u = local.x + local.y * 0.55 - pos;
  float streak = (exp(-u * u / 24.0) + exp(-abs(u) / 18.0) * 0.4) * step(pos, hs.x + 70.0);
  float cell = floor((local.x + hs.x) / 110.0);
  float h = hash(vec2(cell, seed * 13.0));
  vec2 center = vec2((cell + 0.25 + 0.5 * h) * 110.0 - hs.x, (hash(vec2(cell, seed + 4.0)) - 0.5) * hs.y * 1.3);
  float flare = exp(-abs(center.x + center.y * 0.55 - pos) / 22.0) * step(h, 0.75) * step(center.x, hs.x - 4.0);
  vec2 tc = world / 46.0;
  vec2 tid = floor(tc);
  float th = hash(tid + seed * 7.0);
  vec2 tp = (fract(tc) - 0.5 - (hash2(tid + 1.3) - 0.5) * 0.5) * 46.0;
  float pulse = pow(max(sin(t * (0.7 + th * 0.8) + th * 40.0), 0.0), 8.0) * step(th, 0.22) * inside * smoothstep(0.3, 1.0, age);
  float sparkle = star(local - center) * flare * 1.4 + star(tp * 1.7) * pulse * 0.7;
  float hairline = stroke(d, 0.45);
  float sheen = 0.6 + 0.4 * smoothstep(hs.y, -hs.y, local.y);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.94, 0.87, 0.7), 1.0) * inside * 0.6 * sheen * shown;
    c = over(c, vec3(1.0, 0.96, 0.84), clamp(streak * inside, 0.0, 1.0) * 0.9);
    c = over(c, vec3(0.78, 0.64, 0.36), hairline * 0.6 * shown);
    c = over(c, vec3(0.9, 0.66, 0.18), clamp(sparkle * 0.8, 0.0, 1.0));
    return c * fade;
  }
  vec3 champagne = vec3(0.86, 0.78, 0.6);
  vec3 rgb = champagne * inside * 0.1 * sheen * shown + vec3(0.95, 0.9, 0.78) * hairline * 0.35 * shown;
  rgb += vec3(1.0, 0.96, 0.86) * streak * inside * 0.55 + vec3(1.0, 0.92, 0.72) * sparkle;
  return vec4(rgb * fade, inside * 0.3 * shown * fade);
}`,
}
