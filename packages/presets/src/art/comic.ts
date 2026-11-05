import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const comic: Preset = {
  name: 'comic',
  pad: [24, 22, 18],
  tint: [0.98, 0.78, 0.3],
  selection: { dark: 'color:#ffffff', light: 'color:#141008' },
  surface: /* glsl */ `${studio}
float burst(vec2 p, float r) {
  float a = atan(p.y, p.x);
  float k = abs(fract(a / 6.2832 * 11.0) - 0.5) * 2.0;
  return length(p) - r * mix(0.58, 1.0, k);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 22.0 || abs(local.y) > hs.y + 20.0) return vec4(0.0);
  float d = sdBox(local, hs) + (noise(world * 0.05 + seed) - 0.5) * 0.8;
  float pop = smoothstep(0.0, 0.18, age);
  vec4 c = vec4(sky(vec3(0.85, 0.25, 0.35), vec3(0.08, 0.08, 0.1)), 1.0) * solid(sdBox(local - vec2(4.0, 4.0), hs)) * pop;
  vec3 panel = sky(vec3(0.1, 0.18, 0.38), vec3(1.0, 0.94, 0.6));
  c = over(c, panel, solid(d) * pop);
  vec2 cell = fract(rotate(world, 0.785) / 5.0) - 0.5;
  float r = mix(0.12, 0.34, smoothstep(-hs.y, hs.y, local.y)) * sweep(local.x, hs, age, 1400.0, 40.0);
  float dots = solid((length(cell) - r) * 5.0);
  c = over(c, sky(vec3(0.2, 0.34, 0.68), vec3(0.98, 0.62, 0.3)), dots * solid(d) * pop);
  vec3 ink = sky(vec3(0.95, 0.92, 0.84), vec3(0.06, 0.06, 0.08));
  c = over(c, ink, stroke(d, 1.3) * pop);
  float scale = smoothstep(0.15, 0.3, age) * (1.0 + 0.3 * exp(-max(age - 0.3, 0.0) * 9.0) * sin(max(age - 0.3, 0.0) * 30.0));
  vec2 b = rotate(local - vec2(hs.x - 4.0, -hs.y - 3.0), 0.2 + sin(t * 3.0) * 0.04);
  float star = burst(b, 10.0 * scale);
  float shown = (1.0 - cover) * step(60.0, hs.x) * step(0.01, scale);
  c = over(c, ink, solid(star - 1.4) * shown);
  c = over(c, sky(vec3(1.0, 0.82, 0.25), vec3(1.0, 0.36, 0.3)), solid(star) * shown);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
