import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const honey: Preset = {
  name: 'honey',
  pad: [12, 8, 30],
  tint: [0.96, 0.66, 0.14],
  selection: { dark: 'color:#fffbef;text-shadow:0 1px 2px rgb(70 30 0 / .9)', light: 'color:#3a1f00' },
  surface: /* glsl */ `${growth}
float blend(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float front = min(-hs.x - 12.0 + easeOut(age * 1.6) * (2.0 * hs.x + 30.0), hs.x);
  vec2 slab = vec2((front + hs.x) * 0.5, hs.y);
  float d = sdRBox(local - vec2((front - hs.x) * 0.5, 0.0), slab, min(hs.y, 9.0));
  d += (noise(world * 0.04 + t * 0.15) - 0.5) * 1.2;
  float cell = floor(local.x / 34.0);
  float h = hash(vec2(cell, seed * 7.0 + 1.0));
  float x0 = (cell + 0.5) * 34.0 + (h - 0.5) * 14.0;
  float delay = 0.5 + (x0 + hs.x) / 600.0 + h * 0.6;
  float drop = (6.0 + 16.0 * hash(vec2(cell, 4.0))) * easeOut((age - delay) / 3.0) * step(0.5, h) * step(x0, front - 6.0);
  vec2 q = local - vec2(x0, hs.y - 2.0);
  float neck = length(vec2(q.x, q.y - clamp(q.y, 0.0, drop))) - (2.2 + 0.8 * h) * (1.0 - 0.35 * clamp(q.y / max(drop, 1.0), 0.0, 1.0));
  float bead = length(q - vec2(0.0, drop + 0.5)) - min(2.8 + 1.2 * h, drop * 0.4 + 1.5);
  float drip = min(neck, bead);
  d = blend(d, drip, 6.0);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(d - 1.5, 0.0) / 4.0) * smoothstep(-4.0, 4.0, local.y - hs.y * 0.3) * (1.0 - inside) * mix(0.45, 0.14, uLight);
  if (inside <= 0.0) return vec4(vec3(0.06, 0.03, 0.0) * sh, sh) * fade;
  float depth = smoothstep(0.0, 7.0, -d);
  vec3 nrm = normalize(vec3(-dFdx(depth), -dFdy(depth), 0.45));
  float spec = pow(clamp(dot(reflect(normalize(vec3(0.4, 0.7, -0.6)), nrm), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 18.0);
  vec3 thin = mix(vec3(0.98, 0.66, 0.12), vec3(1.0, 0.86, 0.46), uLight);
  vec3 thick = mix(vec3(0.6, 0.27, 0.03), vec3(0.94, 0.64, 0.22), uLight);
  vec3 col = mix(thin, thick, depth * (0.75 + 0.25 * fbm3(world * 0.03 + vec2(t * 0.05, 0.0))));
  col *= 0.88 + 0.12 * smoothstep(hs.y, -hs.y, local.y);
  float streak = smoothstep(3.0, 0.0, abs(local.y + hs.y * 0.55 + sin(world.x * 0.02 + seed * 6.0) * 1.0)) * smoothstep(-1.0, -5.0, d);
  col += vec3(1.0, 0.92, 0.7) * (spec * 0.7 + streak * mix(0.28, 0.35, uLight) * (0.6 + 0.4 * noise(vec2(world.x * 0.05 - t * 0.3, 0.0))));
  vec2 bc = world * 0.12 + seed * 9.0;
  vec2 bi = floor(bc);
  vec2 bf = fract(bc) - 0.25 - 0.5 * hash2(bi);
  float bubble = step(0.95, hash(bi + 2.0)) * smoothstep(0.12, 0.06, abs(length(bf) - 0.1)) * smoothstep(-1.0, -4.0, d);
  col += vec3(1.0, 0.9, 0.6) * bubble * 0.2;
  col *= 1.0 - 0.3 * smoothstep(-1.5, 0.0, d);
  float a = inside * mix(0.92, 0.88, uLight);
  return (vec4(col * a, a) + vec4(0.0, 0.0, 0.0, sh) * (1.0 - a)) * fade;
}`,
}
