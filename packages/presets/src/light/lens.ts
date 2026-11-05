import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const lens: Preset = {
  name: 'lens',
  pad: [28, 18, 22],
  tint: [0.45, 0.62, 1.0],
  selection: { dark: 'color:#f4f8ff;text-shadow:0 1px 2px rgb(5 10 30 / .85)', light: 'color:#0f1a3a' },
  surface: /* glsl */ `${optics}
float hexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float box = sdRBox(local, hs, 6.0);
  if (box > 24.0) return vec4(0.0);
  float lead = 1.0 - cover;
  vec2 src = vec2((hash(vec2(seed, 3.0)) - 0.5) * hs.x * 1.1 + sin(t * 0.35 + seed * 6.0) * 12.0, -hs.y * 0.4);
  vec2 q = local - src;
  float r = length(q);
  float reach = age * 1700.0;
  float streak = exp(-abs(q.y) / 0.9) / (1.0 + abs(q.x) * 0.01) * smoothstep(reach, reach - 60.0, abs(q.x)) * mix(0.45, 1.0, lead);
  float rays = pow(abs(cos(atan(q.y, q.x) * 4.0 + seed * 6.0)), 24.0) * exp(-r / 16.0);
  float source = (exp(-r / 4.0) + exp(-r / 16.0) * 0.35 + rays * 0.5) * lead * smoothstep(0.0, 0.12, age);
  float ring = exp(-abs(r - 26.0) / 1.6) * 0.18 * lead * smoothstep(0.1, 0.5, age);
  vec3 ghosts = vec3(0.0);
  float ghostMask = 0.0;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float along = 0.55 + fk * 0.62;
    float size = 4.0 + 5.0 * hash(vec2(seed, fk + 9.0));
    vec2 g = local - src * (1.0 - along * 2.0) * vec2(1.0, 0.6);
    float sd = hexagon(g, size);
    float on = smoothstep(0.1 + fk * 0.12, 0.45 + fk * 0.12, age) * lead;
    float shape = (solid(sd) * 0.35 + stroke(sd, 0.5) * 0.5) * on;
    ghosts += mix(vec3(0.3, 0.9, 0.8), vec3(0.7, 0.45, 1.0), fract(fk * 0.37 + seed)) * shape;
    ghostMask += shape;
  }
  float inside = solid(box);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.82, 0.86, 0.97), 1.0) * inside * 0.35 * smoothstep(0.0, 0.2, age);
    c = over(c, clamp(ghosts / max(ghostMask, 1e-3), 0.0, 1.0) * 0.8, clamp(ghostMask, 0.0, 1.0) * 0.8);
    c = over(c, vec3(0.98, 0.72, 0.4), clamp(exp(-r / 14.0) * 0.6 * lead + ring, 0.0, 1.0));
    c = over(c, vec3(0.2, 0.36, 0.9), clamp(streak, 0.0, 1.0));
    c = over(c, vec3(0.95, 0.62, 0.22), clamp(exp(-r / 3.0) * lead + rays * lead * 0.4, 0.0, 1.0));
    return c * fade;
  }
  vec3 rgb = vec3(0.1, 0.16, 0.36) * inside * 0.25 * smoothstep(0.0, 0.2, age);
  rgb += vec3(0.55, 0.72, 1.0) * streak + vec3(1.0, 0.94, 0.85) * source + vec3(0.6, 0.7, 1.0) * ring;
  rgb += ghosts * 0.6;
  return vec4(rgb * fade, inside * 0.35 * fade);
}`,
}
