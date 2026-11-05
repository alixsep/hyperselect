import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const origami: Preset = {
  name: 'origami',
  pad: [18, 16, 16],
  tint: [0.95, 0.55, 0.6],
  selection: { dark: 'color:#fff5f6', light: 'color:#2a0c12' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 6.0 || abs(local.y) > hs.y + 12.0) return vec4(0.0);
  float width = 18.0;
  float x = local.x + hs.x;
  float i = floor(x / width);
  float f = fract(x / width);
  float unfold = smoothstep(0.0, 0.5, age * 1.6 - i * width / max(2.0 * hs.x, 1.0) * 0.8);
  float facing = mod(i, 2.0) < 0.5 ? 1.0 : -1.0;
  float peak = abs(fract(x / (2.0 * width)) * 2.0 - 1.0);
  float lift = mix(7.0, 2.0, unfold) * peak;
  float top = -hs.y - lift;
  float bottom = hs.y + lift * 0.6;
  float d = max(max(top - local.y, local.y - bottom), abs(local.x) - hs.x);
  float shadowD = max(max(top + 2.0 - local.y, local.y - bottom - 2.5), abs(local.x - 1.5) - hs.x);
  float diagonal = sign((local.y - top) / max(bottom - top, 1.0) - (facing > 0.0 ? f : 1.0 - f));
  float shade = 1.0 + facing * 0.12 * mix(1.5, 0.6, unfold) + diagonal * 0.035;
  vec3 paper = sky(vec3(0.46, 0.16, 0.21), vec3(1.0, 0.84, 0.82)) * shade * (0.97 + 0.05 * tooth(world * 0.6));
  float shown = smoothstep(0.0, 0.2, age - i * 0.02);
  vec4 c = vec4(vec3(0.0), 1.0) * solid(shadowD) * shown * mix(0.5, 0.12, uLight);
  c = over(c, paper, solid(d) * shown);
  float crease = stroke(min(f, 1.0 - f) * width, 0.4);
  c = over(c, sky(vec3(0.75, 0.38, 0.42), vec3(1.0, 0.96, 0.95)), crease * solid(d) * shown * mix(0.35, 0.6, unfold) * step(0.0, facing));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
