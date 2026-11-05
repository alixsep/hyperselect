import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const diwali: Preset = {
  name: 'diwali',
  pad: [20, 16, 26],
  tint: [1.0, 0.6, 0.2],
  selection: { dark: 'color:#fff6ea;text-shadow:0 1px 2px rgb(30 2 16 / .7)', light: 'color:#2e0c14' },
  surface: /* glsl */ `${festive}
vec3 petal(float k) {
  return k < 1.0 ? sky(vec3(1.0, 0.6, 0.15), vec3(0.95, 0.5, 0.08)) : k < 2.0 ? sky(vec3(0.95, 0.3, 0.55), vec3(0.85, 0.2, 0.45)) : sky(vec3(0.2, 0.72, 0.68), vec3(0.08, 0.55, 0.52));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.15, 0.04, 0.11), vec3(1.0, 0.93, 0.84)), 1.0) * body * 0.93;

  float bloom = floor(world.x / 14.0);
  vec2 r = vec2(mod(world.x, 14.0) - 7.0, local.y + hs.y);
  float a = atan(r.x, r.y);
  float flower = length(r) - 4.6 * (0.55 + 0.45 * abs(cos(a * 3.0)));
  float drawn = smoothstep(0.0, 0.3, age - fract(bloom * 0.618) * 0.5);
  c = over(c, petal(mod(bloom, 3.0)), solid(flower) * body * drawn * 0.75);
  c = over(c, sky(vec3(1.0, 0.85, 0.4), vec3(0.85, 0.6, 0.1)), solid(length(r) - 1.0) * body * drawn);

  float slot = floor(world.x / 34.0);
  vec2 q = vec2(mod(world.x, 34.0) - 17.0, local.y - hs.y - 4.0);
  float placed = step(abs(local.x - q.x), hs.x - 8.0);
  float lit = smoothstep(0.0, 0.25, age - 0.25 - fract(slot * 0.618) * 0.7) * placed;
  float bowl = max(length(vec2(q.x, q.y * 1.7)) - 6.0, -q.y);
  float lip = stroke(length(vec2(q.x, q.y * 4.0)) - 6.0, 0.8) * step(abs(q.y), 2.0);
  vec3 clay = sky(vec3(0.62, 0.28, 0.12), vec3(0.72, 0.34, 0.14)) * (1.0 - 0.35 * clamp(q.y / 4.0, 0.0, 1.0));
  vec4 lamp = vec4(clay, 1.0) * solid(bowl) * placed;
  lamp = over(lamp, sky(vec3(0.85, 0.48, 0.22), vec3(0.88, 0.5, 0.25)), lip * placed);
  vec4 glow = fire(vec2(q.x, -q.y + 0.6), 2.1, t, slot) * lit;
  float warm = exp(-length(q) / 16.0) * lit;
  c.rgb += vec3(1.0, 0.55, 0.2) * warm * (1.0 - uLight) * 0.35 * body;
  c = over(c, vec3(1.0, 0.6, 0.3), warm * uLight * 0.15 * body);
  c = layer(c, lamp);
  c = layer(c, glow);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
