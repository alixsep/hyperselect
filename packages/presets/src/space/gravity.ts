import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const gravity: Preset = {
  name: 'gravity',
  pad: [12, 8, 8],
  tint: [0.56, 0.46, 0.96],
  selection: { dark: 'color:#f1edff', light: 'color:#1c1638' },
  surface: /* glsl */ `${cosmos}
vec2 bend(vec2 p, vec2 mass, float strength) {
  vec2 v = p - mass;
  return v * strength * 260.0 / (dot(v, v) + 260.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(0.0, 0.12, age);
  vec2 m1 = vec2(-hs.x * 0.42 + sin(t * 0.35 + seed * 6.0) * hs.x * 0.18, sin(t * 0.5 + seed) * hs.y * 0.15);
  vec2 m2 = vec2(hs.x * 0.42 + cos(t * 0.3 + seed * 3.0) * hs.x * 0.18, cos(t * 0.45 + seed * 2.0) * hs.y * 0.15);
  float pair = step(140.0, hs.x);
  m1.x *= pair;
  float settle = clamp(age * 1.6 - 0.3, 0.0, 1.0);
  float strength = (1.0 - pow(1.0 - settle, 3.0) + sin(settle * PI) * 0.18) * (0.3 + 0.7 * fade);
  vec2 p = local + bend(local, m1, strength) + bend(local, m2, strength) * pair;
  vec2 g = (world - local + p) / 13.0;
  vec2 cellLine = abs(fract(g) - 0.5) / max(fwidth(g), vec2(1e-3));
  if (inside <= 0.0) return vec4(0.0);
  float grid = smoothstep(0.5, 0.0, min(cellLine.x, cellLine.y) - 0.5);
  float r1 = length(local - m1), r2 = mix(1e3, length(local - m2), pair);
  float r = min(r1, r2);
  float well = exp(-r / 15.0);
  vec3 field = mix(vec3(0.03, 0.025, 0.075), vec3(0.93, 0.92, 0.97), uLight);
  vec3 ink = mix(vec3(0.58, 0.48, 1.0), vec3(0.4, 0.33, 0.74), uLight);
  vec4 col = vec4(field * (1.0 - well * mix(0.6, 0.12, uLight)), 1.0) * mix(voidAlpha(), 0.92, uLight);
  col = over(col, ink * (1.0 + well * 0.5 * (1.0 - uLight)), grid * mix(0.4, 0.32, uLight) * (1.0 - smoothstep(6.0, 3.0, r)));
  float body = smoothstep(4.3, 3.3, r) * settle;
  float ring = smoothstep(1.4, 0.0, abs(r - 6.5)) * settle;
  col = over(col, mix(vec3(0.85, 0.8, 1.0), vec3(0.42, 0.34, 0.78), uLight), ring * 0.7);
  col = over(col, mix(vec3(0.0), vec3(0.08, 0.06, 0.16), uLight), body);
  return col * inside * fade;
}`,
}
