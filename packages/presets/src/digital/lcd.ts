import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const lcd: Preset = {
  name: 'lcd',
  pad: [16, 12, 14],
  tint: [0.62, 0.72, 0.5],
  selection: { dark: 'color:#1a2210', light: 'color:#1a2210' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.1, age);
  vec3 panel = sky(vec3(0.5, 0.58, 0.42), vec3(0.72, 0.78, 0.62));
  vec2 cell = floor(world / 3.0);
  vec2 q = mod(world, 3.0);
  float gap = step(2.4, q.x) + step(2.4, q.y);
  float ghost = exp(-age * 2.2) * step(hash(floor(world / 6.0) + seed), 0.5) * 0.35;
  float response = step(hash(cell + floor(t * 0.4) + seed), 0.035) * 0.12;
  float glare = smoothstep(0.4, 0.0, abs(local.x * 0.25 + local.y - hs.y * 0.2 + sin(t * 0.3) * hs.x * 0.05) / max(hs.y, 1.0)) * 0.08;
  vec3 col = panel * (1.0 - min(gap, 1.0) * 0.06) * (1.0 - ghost - response) + glare;
  float inset = smoothstep(-3.0, 0.0, d) * smoothstep(0.0, -hs.y, local.y + local.x * 0.02);
  col *= 1.0 - inset * 0.35;
  vec4 c = vec4(col, 1.0) * body * 0.95;
  c = over(c, sky(vec3(0.18, 0.22, 0.14), vec3(0.3, 0.36, 0.24)), stroke(d + 0.6, 0.7) * body);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
