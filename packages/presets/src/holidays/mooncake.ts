import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const mooncake: Preset = {
  name: 'mooncake',
  pad: [18, 12, 12],
  tint: [0.9, 0.66, 0.32],
  selection: { dark: 'color:#fff8ec;text-shadow:0 1px 2px rgb(30 12 0 / .7)', light: 'color:#2a1604' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 3.0);
  float d = sdRBox(local, hs, 7.0);
  if (fade < 0.001 || d > 6.0) return vec4(0.0);
  vec2 edge = abs(local) - hs;
  float s = edge.x > edge.y ? local.y : local.x;
  float rim = d - 1.6 * abs(sin(s * PI / 6.0)) + 1.6;
  float body = solid(rim) * smoothstep(0.0, 0.2, age);
  vec2 cell = (fract(world / 14.0) - 0.5) * 14.0;
  float swirl = stroke(length(cell) - 3.8 - 0.6 * sin(atan(cell.y, cell.x) * 2.0 + length(cell)), 0.6);
  float inner = smoothstep(-5.0, -6.5, d);
  float height = smoothstep(0.0, -3.0, rim) * 0.7 + stroke(d + 5.0, 0.8) * 0.5 + swirl * inner * 0.18;
  vec3 n = normalize(vec3(-dFdx(height), -dFdy(height), 0.22));
  float lit = clamp(dot(n, normalize(vec3(-0.5, -0.65, 0.6))), 0.0, 1.0);
  float gloss = pow(clamp(dot(reflect(-normalize(vec3(-0.5, -0.65, 0.6)), n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 18.0);
  float browned = smoothstep(-6.0, 0.0, rim);
  vec3 crust = sky(vec3(0.42, 0.24, 0.09), vec3(0.95, 0.77, 0.5)) * (1.0 - browned * 0.3);
  vec3 color = crust * mix(0.75 + 0.4 * lit, 0.86 + 0.2 * lit, uLight) + gloss * mix(0.12, 0.2, uLight) * vec3(1.0, 0.9, 0.7);
  vec4 c = vec4(color, 1.0) * body * 0.96;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
