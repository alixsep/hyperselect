import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const grid: Preset = {
  name: 'grid',
  pad: [24, 30, 20],
  tint: [0.3, 0.55, 1],
  selection: { dark: 'color:#f2f6ff', light: 'color:#0a1430' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float grow = smoothstep(0.0, 0.25, age);
  vec2 frame = hs * mix(vec2(0.96, 0.8), vec2(1.0), grow);
  float box = sdBox(local, frame);
  float inside = solid(box) * grow;
  vec3 accent = sky(vec3(0.35, 0.6, 1.0), vec3(0.12, 0.42, 0.98));
  vec4 c = vec4(sky(vec3(0.06, 0.1, 0.2), vec3(0.9, 0.94, 1.0)), 1.0) * inside * 0.9;
  float canvas = 1.0 - smoothstep(0.0, 22.0, d);
  float minor = lattice(world / 4.0) * 0.18;
  float major = lattice(world / 16.0) * 0.4;
  c = over(c, accent, max(minor, major) * canvas * grow * mix(0.35, 0.45, uLight));
  c = over(c, accent, stroke(box, 0.5) * grow);
  vec2 handles[8] = vec2[8](vec2(-1.0, -1.0), vec2(0.0, -1.0), vec2(1.0, -1.0), vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0), vec2(-1.0, 1.0), vec2(-1.0, 0.0));
  for (int i = 0; i < 8; i++) {
    float h = sdBox(local - handles[i] * frame, vec2(2.6));
    c = over(c, sky(vec3(0.95, 0.97, 1.0), vec3(1.0)), solid(h) * grow);
    c = over(c, accent, stroke(h, 0.5) * grow);
  }
  float width = floor(frame.x * 2.0);
  float digits = width >= 1000.0 ? 4.0 : width >= 100.0 ? 3.0 : 2.0;
  vec2 tag = vec2(-frame.x + digits * 3.0 + 4.0, -frame.y - 11.0);
  float pill = sdRBox(local - tag, vec2(digits * 3.0 + 4.0, 5.0), 2.5);
  float label = grow * (1.0 - cover);
  c = over(c, accent, solid(pill) * label);
  float text = 0.0;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    if (fk >= digits) break;
    float place = pow(10.0, digits - 1.0 - fk);
    text += digit(local - tag - vec2(-digits * 3.0 + fk * 6.0 + 0.4, -3.75), int(mod(floor(width / place), 10.0)), 1.5);
  }
  c = over(c, vec3(1.0), text * label);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
