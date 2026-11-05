import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const scanner: Preset = {
  name: 'scanner',
  pad: [20, 14, 14],
  tint: [0.3, 0.85, 1],
  selection: { dark: 'color:#f0fbff', light: 'color:#08202e' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float phase = fract(t * 0.3 + seed);
  float travel = abs(phase * 2.0 - 1.0);
  float x = mix(-hs.x, hs.x, smoothstep(0.0, 1.0, travel));
  float dir = phase < 0.5 ? -1.0 : 1.0;
  float dx = local.x - x;
  float wake = exp(-max(dx * dir, 0.0) / 60.0) * step(0.0, dx * dir);
  vec3 laser = sky(vec3(0.45, 0.95, 1.0), vec3(0.0, 0.55, 0.85));
  vec4 c = vec4(sky(vec3(0.03, 0.06, 0.09), vec3(0.94, 0.97, 0.99)), 1.0) * body * 0.94;
  c = over(c, laser, wake * body * 0.12);
  c = over(c, laser, scanline(world.y, 2.0) * body * 0.05);
  float core = exp(-dx * dx / 1.2);
  float glow = exp(-dx * dx / 40.0);
  float beyond = smoothstep(12.0, 0.0, max(d, 0.0)) * step(abs(local.y), hs.y + 12.0);
  c = over(c, laser, glow * mix(0.35, 0.18, uLight) * beyond);
  c = over(c, sky(vec3(0.9, 1.0, 1.0), vec3(0.0, 0.45, 0.75)), core * beyond);
  vec2 corner = abs(local) - hs - 3.0;
  float bracket = (stroke(corner.x, 0.6) * step(corner.y, 0.0) * step(-7.0, corner.y) + stroke(corner.y, 0.6) * step(corner.x, 0.0) * step(-7.0, corner.x)) * smoothstep(0.0, 0.3, age);
  c = over(c, laser, bracket * mix(0.8, 0.9, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
