import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const tape: Preset = {
  name: 'tape',
  pad: [16, 8, 12],
  tint: [0.36, 0.62, 0.9],
  selection: { dark: 'color:#061a33', light: 'color:#061a33' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float ang = (hash(vec2(seed, 5.0)) - 0.5) * 0.014;
  vec2 l = vec2(local.x, local.y + local.x * ang);
  vec2 hs = halfSize + vec2(10.0, 2.0);
  float front = min(-hs.x - 10.0 + age * 1300.0, -hs.x - 12.0 + (2.0 * hs.x + 24.0) * fade);
  float tear = abs(fract(l.y * 0.33 + seed * 7.0) - 0.5) * 3.0 + noise(vec2(l.y * 0.5, seed * 9.0)) * 1.6;
  float edges = abs(l.y) - hs.y;
  float strip = max(max(abs(l.x) - hs.x + tear, edges), l.x - front);
  float rolling = step(front, hs.x - tear);
  float roll = max(max(edges, abs(l.x - front - 4.0) - 4.0), -hs.x - l.x) + (1.0 - rolling) * 1e3;
  float d = min(strip, roll);
  float inside = solid(d);
  float sh = drop(d - 0.5, 2.5) * (1.0 - inside) * mix(0.45, 0.14, uLight) * step(l.y, hs.y + 6.0);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh);
  float crepe = noise(vec2(world.x * 0.9, world.y * 0.07));
  float mottle = fbm3(world * 0.04 + seed * 3.0);
  vec3 blue = mix(vec3(0.24, 0.5, 0.82), vec3(0.52, 0.73, 0.94), uLight);
  vec3 col = blue * (0.94 + 0.06 * crepe + 0.1 * (mottle - 0.5));
  col *= 1.0 + 0.12 * smoothstep(1.0, 0.0, abs(l.y + hs.y - 0.8));
  col *= 1.0 - 0.18 * smoothstep(1.0, 0.0, abs(l.y - hs.y + 0.8));
  float u = clamp((l.x - front) / 8.0, 0.0, 1.0);
  float cyl = sin(u * PI);
  vec3 rollCol = blue * (0.55 + 0.6 * cyl) + vec3(0.25) * pow(cyl, 8.0);
  col = mix(col, rollCol, step(front, l.x) * rolling);
  col *= 1.0 - 0.25 * exp(-max(front - l.x, 0.0) / 3.0) * rolling;
  vec4 c = vec4(col * inside, inside) * 0.94 + vec4(0.0, 0.0, 0.0, sh);
  return c;
}`,
}
