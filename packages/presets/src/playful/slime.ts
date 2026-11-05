import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const slime: Preset = {
  name: 'slime',
  pad: [22, 18, 46],
  tint: [0.45, 0.9, 0.35],
  selection: { dark: 'color:#f5ffef', light: 'color:#0f2608' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 20.0 || local.y < -hs.y - 18.0 || local.y > hs.y + 46.0) return vec4(0.0);
  float slot = 17.0;
  float id = floor(world.x / slot);
  float h = hash(vec2(id, seed));
  float cx = (id + 0.5) * slot + (h - 0.5) * 6.0 - world.x + local.x;
  float cycle = fract(t * (0.18 + h * 0.12) + h * 7.0 + 0.618 * id);
  float live = step(0.45, h) * smoothstep(0.0, 0.5, age) * step(abs(cx), hs.x - 6.0);
  float stretch = smoothstep(0.0, 0.75, cycle) * 20.0 * live;
  float neck = 1.6 + 1.6 * (1.0 - cycle);
  vec2 q = vec2(local.x - cx, local.y - hs.y);
  float strand = max(abs(q.x) - neck * (1.0 - clamp(q.y / max(stretch, 0.01), 0.0, 1.0) * 0.5), q.y - stretch);
  float bulb = length(q - vec2(0.0, stretch)) - (2.0 + 1.6 * smoothstep(0.2, 0.75, cycle)) * live;
  float fall = smoothstep(0.75, 1.0, cycle);
  float drop = length(q - vec2(0.0, stretch + fall * fall * 26.0)) - 2.6 * live * step(0.75, cycle) * (1.0 - fall * 0.4);
  float goo = sdRBox(local + vec2(0.0, sin(local.x * 0.08 + t * 1.5) * 0.8), hs, min(hs.y, 9.0));
  float k = 5.0;
  float drip = cycle < 0.75 ? min(strand, bulb) : length(q) - 3.2 * live * (1.0 - fall);
  float hh = clamp(0.5 + 0.5 * (drip - goo) / k, 0.0, 1.0);
  float d = mix(drip, goo, hh) - k * hh * (1.0 - hh);
  d = min(d, drop);
  float body = solid(d) * smoothstep(0.0, 0.25, age);
  float inside = smoothstep(0.0, -6.0, d);
  vec3 dark = sky(vec3(0.07, 0.3, 0.04), vec3(0.3, 0.72, 0.12));
  vec3 bright = sky(vec3(0.32, 0.78, 0.12), vec3(0.6, 0.95, 0.3));
  vec3 goocolor = mix(dark, bright, inside * (0.6 + 0.4 * noise(world * 0.05 + t * 0.2)));
  vec4 c = vec4(goocolor, 1.0) * body * mix(0.85, 0.92, uLight);
  vec2 g = vec2(dFdx(d), dFdy(d));
  vec2 n = g / max(length(g), 1e-3);
  float rim = smoothstep(-4.0, -0.5, d) * smoothstep(0.0, -0.5, d) * max(dot(n, normalize(vec2(-0.5, -1.0))), 0.0);
  c = over(c, vec3(0.9, 1.0, 0.8), rim * 0.8 * body);
  vec3 v = voronoi(world * 0.12 + seed * 5.0 + vec2(0.0, -t * 0.15));
  float bubble = smoothstep(0.16, 0.11, v.x) * smoothstep(0.06, 0.1, v.x) * step(0.7, fract(v.z * 7.0)) * inside;
  c = over(c, sky(vec3(0.55, 0.95, 0.35), vec3(0.85, 1.0, 0.7)), bubble * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
