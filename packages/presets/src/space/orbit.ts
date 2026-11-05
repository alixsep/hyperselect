import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const orbit: Preset = {
  name: 'orbit',
  pad: [22, 14, 14],
  tint: [0.5, 0.68, 0.95],
  selection: { dark: 'color:#eef4ff', light: 'color:#14213a' },
  surface: /* glsl */ `${cosmos}
vec2 track(vec2 b, float s) {
  float straight = 2.0 * (b.x - b.y), arc = PI * b.y;
  float u = fract(s) * (2.0 * straight + 2.0 * arc);
  if (u < straight) return vec2(-b.x + b.y + u, -b.y);
  u -= straight;
  if (u < arc) { float a = -PI * 0.5 + u / b.y; return vec2(b.x - b.y + cos(a) * b.y, sin(a) * b.y); }
  u -= arc;
  if (u < straight) return vec2(b.x - b.y - u, b.y);
  u -= straight;
  float a = PI * 0.5 + u / b.y;
  return vec2(-b.x + b.y + cos(a) * b.y, sin(a) * b.y);
}

vec4 planet(vec4 below, vec2 q, float r, vec3 tone) {
  float body = smoothstep(r + 0.7, r - 0.7, length(q));
  float lit = clamp(0.55 - dot(q / r, vec2(0.55, 0.45)) * 0.6, 0.15, 1.0);
  return over(below, tone * lit, body);
}

float along(vec2 p, vec2 b) {
  float reach = b.x - b.y;
  if (abs(p.x) <= reach) return p.y < 0.0 ? p.x : 4.0 * reach - p.x;
  return sign(p.x) * reach + atan(p.y, abs(p.x)) * b.y * sign(p.x);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 inner = halfSize + vec2(4.0, -2.0);
  vec2 outer = halfSize + vec2(14.0, 5.0);
  float d1 = sdRBox(local, inner, inner.y);
  float d2 = sdRBox(local, outer, outer.y);
  float w1 = fwidth(d1), w2 = fwidth(d2);
  if (d2 > 10.0) return vec4(0.0);
  float draw = smoothstep(-30.0, 0.0, age * 1500.0 - (local.x + outer.x));
  float fill = smoothstep(w1, -w1, d1) * smoothstep(0.0, 0.3, age);
  float path1 = smoothstep(w1 * 1.3, 0.0, abs(d1) - 0.35) * draw;
  float dash = step(0.45, fract(along(local, outer) / 7.0));
  float path2 = smoothstep(w2 * 1.3, 0.0, abs(d2) - 0.3) * dash * draw * (1.0 - cover * smoothstep(0.0, -4.0, local.y));
  vec3 fillColor = mix(vec3(0.03, 0.06, 0.14), vec3(0.86, 0.91, 0.98), uLight);
  vec3 ink = mix(vec3(0.6, 0.72, 0.95), vec3(0.24, 0.36, 0.6), uLight);
  vec4 c = vec4(fillColor, 1.0) * fill * mix(0.7, 0.8, uLight);
  c = over(c, ink, path1 * 0.7);
  c = over(c, ink, path2 * 0.45);
  float l1 = 4.0 * (inner.x - inner.y) + 2.0 * PI * inner.y;
  float l2 = 4.0 * (outer.x - outer.y) + 2.0 * PI * outer.y;
  float arrive = smoothstep(0.35, 0.7, age);
  vec2 a = track(inner, t * 60.0 / l1 + seed);
  vec2 b = track(outer, t * 38.0 / l2 + seed * 3.0 + 0.5);
  vec2 m = track(inner, t * 60.0 / l1 + seed + 0.5);
  vec3 blue = mix(vec3(0.5, 0.75, 1.0), vec3(0.24, 0.48, 0.86), uLight);
  vec3 amber = mix(vec3(1.0, 0.76, 0.46), vec3(0.88, 0.56, 0.24), uLight);
  vec3 stone = mix(vec3(0.78, 0.8, 0.86), vec3(0.45, 0.48, 0.55), uLight);
  if (uLight < 0.5) {
    float halo = exp(-length(local - a) / 4.0) * 0.5 + exp(-length(local - b) / 5.0) * 0.5;
    c.rgb += (blue + amber) * 0.5 * halo * arrive;
  }
  c = planet(c, local - a, 3.2 * arrive, blue);
  c = planet(c, local - b, 4.2 * arrive, amber);
  c = planet(c, local - m, 1.8 * arrive, stone);
  return c * fade;
}`,
}
