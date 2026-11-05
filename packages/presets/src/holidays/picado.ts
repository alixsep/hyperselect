import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const picado: Preset = {
  name: 'picado',
  pad: [18, 44, 12],
  tint: [0.98, 0.35, 0.55],
  selection: { dark: 'color:#fffaf4', light: 'color:#2a1020' },
  surface: /* glsl */ `${festive}
vec3 tissue(float k) {
  return k < 1.0 ? vec3(0.98, 0.3, 0.55) : k < 2.0 ? vec3(1.0, 0.55, 0.15) : k < 3.0 ? vec3(1.0, 0.8, 0.18) : k < 4.0 ? vec3(0.22, 0.72, 0.38) : k < 5.0 ? vec3(0.2, 0.55, 0.95) : vec3(0.62, 0.36, 0.86);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 24.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.12, 0.07, 0.1), vec3(1.0, 0.97, 0.91)), 1.0) * body * 0.92;

  float hung = step(40.0, hs.x) * step(abs(local.x), hs.x);
  float cord = -hs.y - 19.0 + drape(world.x, 17.0, 1.2);
  c = over(c, sky(vec3(0.8, 0.75, 0.7), vec3(0.42, 0.36, 0.32)), stroke(local.y - cord, 0.4) * hung);
  float slot = floor(world.x / 17.0);
  float sway = sin(t * 1.6 + slot * 1.3) * 0.06 * smoothstep(0.0, 0.6, age);
  vec2 q = rotate(vec2(mod(world.x, 17.0) - 8.5, local.y - cord), sway);
  float u = fract(q.x / 3.5 + 0.5) * 2.0 - 1.0;
  float edge = q.y - 14.0 + 1.3 * sqrt(max(1.0 - u * u, 0.0));
  float sheet = max(max(abs(q.x) - 6.5, -q.y), edge);
  vec2 cut = (fract(q / 3.5 + vec2(0.5, 0.0)) - 0.5) * 3.5;
  vec2 f = q - vec2(0.0, 7.0);
  float lattice = max(max(abs(cut.x) + abs(cut.y) - 0.9, sdBox(f, vec2(4.6, 4.2))), 3.4 - length(f));
  float flower = max(length(f) - 2.6 * (0.6 + 0.4 * abs(cos(atan(f.y, f.x) * 3.0))), 0.9 - length(f));
  float hole = solid(min(lattice, flower));
  float drop = smoothstep(0.0, 0.3, age - fract(slot * 0.618) * 0.4);
  float paper = solid(sheet) * (1.0 - hole) * hung * drop;
  vec3 color = tissue(mod(slot, 6.0)) * (0.88 + 0.12 * cos(sway * 12.0 + q.y * 0.08));
  c = over(c, sky(vec3(0.0), vec3(0.3, 0.1, 0.2)), solid(sheet - 0.6) * hung * drop * uLight * 0.12 * (1.0 - paper));
  c = over(c, color, paper * mix(0.9, 0.92, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
