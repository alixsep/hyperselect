import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const laser: Preset = {
  name: 'laser',
  pad: [16, 10, 10],
  tint: [1.0, 0.12, 0.16],
  selection: { dark: 'color:#fff1f1;text-shadow:0 1px 2px rgb(30 0 0 / .9)', light: 'color:#3d0408' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.5);
  float box = sdRBox(local, hs, 2.0);
  if (box > 10.0) return vec4(0.0);
  float head = -hs.x - 4.0 + age * 1800.0;
  float drawn = smoothstep(1.0, -1.0, local.x - min(head, hs.x + 4.0)) * step(-hs.x - 5.0, local.x);
  float dTop = abs(local.y + hs.y) / max(1.0 - cover, 1e-3);
  float dBottom = abs(local.y - hs.y);
  float dRail = min(dTop, dBottom);
  float haze = 0.55 + 0.45 * fbm3(vec2(world.x * 0.025 - t * 0.5, world.y * 0.06 + t * 0.2));
  float rail = smoothstep(0.85, 0.15, dRail) * drawn;
  float railGlow = (exp(-dRail / 1.5) * 0.5 + exp(-dRail / 6.0) * 0.16 * haze) * drawn;
  float settle = smoothstep(0.0, 0.6, age - (2.0 * hs.x) / 1800.0);
  float sx = sin(t * 0.8 + seed * 6.28) * (hs.x - 2.0) * settle + (1.0 - settle) * min(head, hs.x);
  float dx = abs(local.x - sx + local.y * 0.18);
  float inside = solid(box);
  float sheet = (smoothstep(0.8, 0.1, dx) * 0.9 + exp(-dx / 4.0) * 0.4 * haze + exp(-dx / 22.0) * 0.12 * haze) * inside * drawn;
  vec2 tipA = vec2(min(head, hs.x + 4.0), hs.y), tipB = vec2(tipA.x, -hs.y);
  float tips = exp(-length(local - tipA) / 2.5) + exp(-length(local - tipB) / 2.5) * (1.0 - cover);
  float cross = exp(-length(vec2(dx, dBottom)) / 2.5) + exp(-length(vec2(dx, dTop)) / 2.5);
  float hot = clamp(tips + cross * inside * 0.8, 0.0, 1.5);
  vec3 red = vec3(1.0, 0.07, 0.1), white = vec3(1.0, 0.84, 0.82);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(1.0, 0.74, 0.74), 1.0) * clamp(inside * 0.14 * drawn + railGlow * 0.9 + sheet * 0.7 + hot * 0.4, 0.0, 1.0);
    c = over(c, vec3(0.84, 0.04, 0.08), clamp(rail + smoothstep(0.6, 0.1, dx) * inside * drawn * 0.7 + hot * 0.6, 0.0, 1.0));
    return c * fade;
  }
  vec3 rgb = white * (rail * 1.2 + hot) + red * (railGlow * 1.4 + sheet + hot * 0.6 + inside * drawn * (0.03 + 0.05 * haze));
  return vec4(rgb * fade, inside * drawn * 0.3 * fade);
}`,
}
