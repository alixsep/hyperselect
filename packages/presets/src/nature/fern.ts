import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const fern: Preset = {
  name: 'fern',
  pad: [18, 12, 12],
  tint: [0.38, 0.66, 0.22],
  selection: { dark: 'color:#f5fbec;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#12250a' },
  surface: /* glsl */ `${growth}
float rachisY(float x, float span, float t) {
  return -sin(clamp(x / span, 0.0, 1.0) * PI) * 2.5 + sin(t * 0.9 + x * 0.012) * 1.0;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float left = -hs.x - 4.0;
  float span = 2.0 * hs.x + 12.0;
  float front = left + span * easeOut(age * 1.1 + 0.05);
  float x = local.x - left;
  if (x < -6.0 || local.x > front + 12.0) return vec4(0.0);
  float reach = front - left;
  float wash = smoothstep(2.0, -6.0, sdRBox(local, hs, 8.0)) * smoothstep(0.0, 30.0, front - local.x);
  vec4 col = vec4(mix(vec3(0.02, 0.07, 0.03), vec3(0.74, 0.84, 0.66), uLight), 1.0) * wash * mix(0.5, 0.3, uLight);
  float maxLen = hs.y + 5.0;
  float lean = 0.95;
  float spacing = 8.5;
  float dy = local.y - rachisY(x, span, t);
  float side = dy < 0.0 ? -1.0 : 1.0;
  float offset = side > 0.0 ? spacing * 0.5 : 0.0;
  float slot = floor((x - abs(dy) * lean - offset) / spacing + 0.5);
  vec3 dark = mix(vec3(0.15, 0.34, 0.08), vec3(0.44, 0.64, 0.3), uLight);
  vec3 bright = mix(vec3(0.44, 0.68, 0.2), vec3(0.66, 0.82, 0.46), uLight);
  for (int k = -1; k <= 1; k++) {
    float xa = (slot + float(k)) * spacing + offset;
    if (xa < 2.0 || xa > reach - 2.0) continue;
    float f = xa / reach;
    float profile = pow(sin(clamp(f, 0.0, 1.0) * PI), 0.6) * (0.55 + 0.45 * smoothstep(0.0, 0.25, f)) * smoothstep(1.0, 0.82, f);
    float len = maxLen * profile * (0.6 + 0.4 * fade);
    if (len < 1.0) continue;
    float ang = atan(1.0, lean) + sin(t * 1.3 + xa * 0.05) * 0.04;
    vec2 dir = vec2(cos(ang), sin(ang) * side);
    vec2 v = vec2(x - xa, dy);
    float along = dot(v, dir);
    float across = dot(v, vec2(-dir.y, dir.x)) * side - along * along * 0.012;
    float u = along / len;
    if (u < 0.0 || u > 1.0) continue;
    float lobes = 0.4 + 0.6 * abs(sin(along * 0.95));
    float width = 3.9 * (1.0 - u * 0.85) * lobes * smoothstep(0.0, 0.08, u);
    float frond = smoothstep(0.55, -0.55, abs(across) - width);
    if (frond <= 0.0) continue;
    vec3 green = mix(dark, bright, smoothstep(0.1, 1.0, u) * 0.8 + 0.2 * smoothstep(0.6, 1.0, f));
    green *= across > 0.0 ? 1.06 : 0.86;
    green *= 1.0 - 0.35 * smoothstep(0.45, 0.0, abs(across)) * step(u, 0.9);
    col = over(col, green, frond);
  }
  float stalk = smoothstep(0.6, -0.6, abs(dy) - 1.0 * (1.0 - 0.6 * x / span)) * step(0.0, x) * step(local.x, front - 2.0);
  col = over(col, dark * 0.8, stalk);
  vec2 coil = local - vec2(front, rachisY(reach, span, t) - 3.0);
  float unrolled = smoothstep(0.75, 1.0, reach / span);
  float radius = 5.0 * (1.0 - unrolled);
  float r = length(coil);
  float turns = atan(-coil.y, coil.x) / 6.283 + 0.5;
  float pitch = radius * 0.4 + 0.01;
  float spiral = abs(fract(r / pitch - turns + 0.5) - 0.5) * pitch;
  float fiddle = smoothstep(0.9, 0.3, spiral) * step(r, radius) * step(0.4, radius);
  col = over(col, bright, fiddle);
  return col * fade;
}`,
}
