import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const yarn: Preset = {
  name: 'yarn',
  pad: [40, 18, 30],
  tint: [0.92, 0.5, 0.42],
  selection: { dark: 'color:#fff8f2;text-shadow:0 1px 2px rgb(20 6 6 / .9)', light: 'color:#2a0e0a;text-shadow:0 0 4px rgb(255 250 245 / .9)' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 40.0 || local.y < -hs.y - 18.0 || local.y > hs.y + 30.0) return vec4(0.0);
  float fuzz = (fbm3(world * 0.35) - 0.5) * 2.2;
  float d = sdRBox(local, hs, 4.0) + fuzz;
  float knit = smoothstep(0.0, 0.6, age);
  float row = floor((local.y + hs.y) / 6.0);
  float rowsKnit = step(row, knit * (hs.y * 2.0 / 6.0 + 1.0));
  float body = solid(d) * rowsKnit;
  vec2 cs = vec2(9.0, 6.0);
  vec2 p = (fract(vec2(world.x, local.y + hs.y) / cs) - 0.5) * cs;
  p.x = abs(p.x);
  float leg = segment(p, vec2(3.9, -3.6), vec2(0.7, 3.2));
  float fill = clamp(1.0 - leg / 2.2, 0.0, 1.0);
  float ply = 0.88 + 0.12 * sin((p.y + p.x * 0.6) * 2.4);
  float stitch = sqrt(fill) * ply;
  float band = mod(floor(row / 2.0) + floor(seed * 4.0), 4.0);
  vec3 wool = band < 1.0 ? sky(vec3(0.5, 0.15, 0.16), vec3(1.0, 0.78, 0.74)) : band < 2.0 ? sky(vec3(0.3, 0.22, 0.18), vec3(1.0, 0.95, 0.88)) : band < 3.0 ? sky(vec3(0.1, 0.28, 0.3), vec3(0.76, 0.9, 0.9)) : sky(vec3(0.3, 0.22, 0.18), vec3(1.0, 0.95, 0.88));
  vec3 col = wool * mix(0.45, 1.06, stitch);
  vec4 c = vec4(col, 1.0) * body * 0.95;
  float halo = smoothstep(2.5, 0.0, d) * (1.0 - body) * step(noise(world * 1.3), 0.45) * rowsKnit;
  c = over(c, wool, halo * 0.5);
  vec2 tail = vec2(hs.x + 2.0, hs.y - 3.0);
  float s = local.x - tail.x;
  float reach = 34.0 * smoothstep(0.4, 1.2, age);
  float curve = tail.y + s * s * 0.012 + sin(s * 0.18 - t * 2.4) * 3.0 * smoothstep(0.0, 12.0, s);
  float thread = stroke(local.y - curve, 0.9 + fuzz * 0.15) * step(0.0, s) * step(s, reach);
  c = over(c, wool * 0.95 + vec3(0.05), thread);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
