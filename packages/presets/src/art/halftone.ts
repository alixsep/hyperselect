import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const halftone: Preset = {
  name: 'halftone',
  pad: [20, 14, 14],
  tint: [0.35, 0.72, 0.9],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(0 0 0 / .7)', light: 'color:#101418' },
  surface: /* glsl */ `${studio}
float screen(vec2 p, float angle, float amount) {
  vec2 cell = fract(rotate(p, angle) / 4.0) - 0.5;
  return solid((length(cell) - sqrt(clamp(amount, 0.0, 1.0)) * 0.6) * 4.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 8.0) return vec4(0.0);
  float edge = smoothstep(4.0, -2.0, d) * mix(0.4, 1.0, smoothstep(-12.0, -2.0, d)) * sweep(local.x, hs, age, 1000.0, 60.0);
  float cyan = screen(world + vec2(0.7, 0.0), 0.26, (0.1 + 0.3 * noise(world * 0.01 + seed)) * edge);
  float magenta = screen(world - vec2(0.0, 0.6), 1.31, (0.08 + 0.28 * noise(world * 0.012 + seed + 7.0)) * edge);
  float yellow = screen(world, 0.0, (0.15 + 0.35 * noise(world * 0.009 + seed + 13.0)) * edge);
  vec3 paper = vec3(0.99, 0.98, 0.95);
  vec3 printed = paper * (1.0 - cyan * vec3(0.55, 0.12, 0.0)) * (1.0 - magenta * vec3(0.08, 0.5, 0.15)) * (1.0 - yellow * vec3(0.0, 0.06, 0.55));
  vec3 glowing = vec3(0.1, 0.1, 0.13) + cyan * vec3(0.0, 0.3, 0.4) + magenta * vec3(0.42, 0.0, 0.3) + yellow * vec3(0.38, 0.33, 0.0);
  vec4 c = vec4(mix(glowing, printed, uLight), 1.0) * solid(d) * smoothstep(0.0, 0.15, age) * 0.94;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
