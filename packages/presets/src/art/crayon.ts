import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const crayon: Preset = {
  name: 'crayon',
  pad: [20, 14, 14],
  tint: [0.95, 0.45, 0.38],
  selection: { dark: 'color:#fff6f2', light: 'color:#2a0e08' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 12.0 || abs(local.y) > hs.y + 8.0) return vec4(0.0);
  float a = world.x + world.y * 0.6;
  float b = world.x - world.y * 0.6 + 2.0;
  float ia = floor(a / 5.0), ib = floor(b / 5.0);
  float reachA = abs(local.y) - hs.y - (hash(vec2(ia, seed)) - 0.35) * 5.0;
  float reachB = abs(local.y) - hs.y - (hash(vec2(ib, seed + 3.0)) - 0.35) * 5.0;
  float sides = abs(local.x) - hs.x - (noise(vec2(local.y * 0.3, seed)) - 0.3) * 6.0;
  float lineA = stroke(mod(a, 5.0) - 2.5, 1.5 + 0.5 * noise(vec2(ia, world.y * 0.1))) * solid(max(reachA, sides));
  float lineB = stroke(mod(b, 5.0) - 2.5, 1.1 + 0.5 * noise(vec2(ib, world.y * 0.1 + 5.0))) * solid(max(reachB, sides));
  float grit = tooth(world * vec2(0.9, 1.4));
  float wax = smoothstep(0.26, 0.4, grit);
  float film = solid(max(abs(local.y) - hs.y + 1.0, sides)) * 0.35;
  float drawn = sweep(local.x, hs, age, 1000.0, 10.0);
  vec3 color = sky(vec3(0.6, 0.22, 0.2), vec3(1.0, 0.6, 0.5));
  vec4 c = vec4(color, 1.0) * film * wax * drawn;
  c = over(c, color, lineA * wax * drawn * 0.85);
  c = over(c, color * sky(vec3(1.15), vec3(0.94)), lineB * wax * sweep(local.x, hs, age - 0.18, 1000.0, 10.0) * 0.7);
  c = over(c, sky(vec3(0.95, 0.55, 0.5), vec3(1.0, 0.85, 0.8)), lineA * lineB * smoothstep(0.7, 0.9, grit) * drawn * 0.35);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
