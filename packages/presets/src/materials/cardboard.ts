import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const cardboard: Preset = {
  name: 'cardboard',
  pad: [14, 10, 16],
  tint: [0.68, 0.5, 0.32],
  selection: { dark: 'color:#1e1206', light: 'color:#1e1206' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 3.0);
  float slide = easeOut(age * 3.0);
  vec2 p = local + vec2(26.0 * (1.0 - slide), 0.0);
  float end = sign(p.x);
  float tear = (fbm3(vec2(p.y * 0.12, seed * 9.0 + end * 3.0)) - 0.5) * 9.0 + (noise(vec2(p.y * 0.9, seed + end)) - 0.5) * 1.6;
  float rows = abs(p.y) - hs.y;
  float board = max(abs(p.x) - hs.x + tear * 0.4, rows);
  float liner = max(abs(p.x) - hs.x + 10.0 + tear, rows);
  float inside = solid(board);
  float face = solid(liner);
  float sh = drop(max(abs(p.x - 1.5) - hs.x, abs(p.y - 3.5) - hs.y), 4.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * slide;
  float fiber = noise(vec2(world.x * 0.25, world.y * 1.1) + seed * 4.0);
  float blotch = fbm(world * 0.02 + seed * 6.0);
  float rib = sin(world.x * 1.26);
  vec3 kraft = mix(vec3(0.7, 0.53, 0.34), vec3(0.8, 0.66, 0.5), uLight);
  vec3 col = kraft * (0.9 + 0.1 * fiber + 0.14 * (blotch - 0.5)) * (1.0 - 0.035 * rib);
  vec3 medium = kraft * (0.88 + 0.22 * rib);
  vec3 lip = mix(kraft * 1.25, vec3(0.95, 0.9, 0.82), 0.4) * (0.8 + 0.4 * fiber);
  float torn = smoothstep(1.4, 0.0, abs(liner + 0.7)) * face;
  col = mix(medium * (1.0 - 0.3 * smoothstep(2.5, 0.0, liner)), col, face);
  col = mix(col, lip, torn * 0.7);
  col *= 1.0 - 0.25 * smoothstep(1.2, 0.0, -rows);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * slide;
}`,
}
