import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'
import { twinkle } from './sparkle'

export const disco: Preset = {
  name: 'disco',
  pad: [26, 30, 20],
  tint: [0.75, 0.5, 1],
  selection: { dark: 'color:#fff;text-shadow:0 0 8px rgb(200 150 255 / .6)', light: 'color:#1c0c36' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 10.0));
  if (fade < 0.001 || d > 26.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.06, 0.03, 0.12), vec3(0.95, 0.92, 1.0)), 1.0) * body * 0.94;
  vec2 g = turn(0.25) * (world + vec2(t * 26.0, sin(t * 0.7) * 10.0)) / 11.0;
  vec2 id = floor(g);
  vec2 q = (fract(g) - 0.5) * 11.0;
  float h = hash(id + floor(seed * 9.0));
  float spot = exp(-dot(q, q) / (2.0 + h * 2.0)) * step(0.35, h);
  vec3 hue = rainbow(h * 3.0 + t * 0.05);
  vec3 light = sky(hue * 1.1 + 0.15, hue * 0.75);
  c = over(c, light, spot * body * (0.55 + 0.45 * sin(t * 3.0 + h * 20.0)));
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 origin = vec2(sin(t * 0.5 + fi * 3.0) * hs.x, -hs.y - 40.0);
    vec2 dir = normalize(local - origin);
    float a = atan(dir.x, dir.y) - sin(t * (0.9 + fi * 0.4) + fi * 2.0) * 0.6;
    float beam = exp(-a * a * 90.0);
    vec3 tint = fi < 0.5 ? vec3(0.95, 0.4, 1.0) : vec3(0.35, 0.85, 1.0);
    c = over(c, sky(tint, tint * 0.7), beam * body * 0.32);
  }
  float floorline = exp(-abs(local.y - hs.y + 1.0) / 1.5) * body;
  c = over(c, sky(vec3(0.9, 0.7, 1.0), vec3(0.55, 0.35, 0.85)), floorline * 0.4 * (0.6 + 0.4 * sin(world.x * 0.15 - t * 6.0)));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
${twinkle}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float pulse = sin(life * 3.1416);
  float s = twinkle(p * 1.4 / max(pulse, 0.05), 10.0) * pulse;
  vec3 c = rainbow(seed + t * 0.1) * 0.6 + 0.5;
  float a = clamp(s, 0.0, 1.0) * alpha;
  return vec4(sky(c, c * 0.55) * a * 1.2, a * uLight);
}`,
  behavior: rise({ rate: 3, speed: [4, 14], wobble: 6, size: [10, 20], life: [0.6, 1.2] }),
}
