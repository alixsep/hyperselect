import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { studio, tone } from './shared'

export const blot: Preset = {
  name: 'blot',
  pad: [22, 18, 18],
  tint: [0.5, 0.48, 0.92],
  selection: { dark: 'color:#f5f4ff', light: 'color:#161430' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float box = sdRBox(local, hs, min(hs.y, 10.0));
  if (fade < 0.001 || box > 20.0) return vec4(0.0);
  vec2 m = vec2(abs(local.x), local.y);
  float lobes = fbm(m * 0.05 + seed * 7.0) - 0.5;
  float field = box + lobes * 14.0 - 2.0;
  float spread = age * 1000.0 - m.x + lobes * 60.0;
  float body = solid(field) * smoothstep(0.0, 8.0, spread);
  vec2 g = floor(m / 7.0);
  vec2 o = (g + 0.5 + (hash2(g + seed) - 0.5) * 0.6) * 7.0;
  float r = 0.5 + 1.8 * pow(hash(g + seed + 2.0), 2.0);
  float near = sdRBox(o, hs, min(hs.y, 10.0));
  float drop = solid(length(m - o) - r) * step(0.8, hash(g + seed + 5.0)) * step(4.0, near) * step(near, 16.0) * smoothstep(0.0, 8.0, spread - 40.0);
  float ink = max(body, drop);
  float depth = smoothstep(0.0, -10.0, field);
  vec3 color = mix(sky(vec3(0.24, 0.22, 0.5), vec3(0.74, 0.75, 0.96)), sky(vec3(0.15, 0.13, 0.34), vec3(0.64, 0.65, 0.93)), depth);
  vec4 c = vec4(color, 1.0) * ink * 0.95;
  c = over(c, sky(vec3(0.4, 0.38, 0.75), vec3(0.32, 0.32, 0.66)), stroke(field + 1.2, 1.0) * body * 0.7);
  c = over(c, sky(vec3(0.5, 0.48, 0.85), vec3(0.95, 0.95, 1.0)), stroke(local.x, 0.35) * body * 0.4);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float drop = solid(length(p * vec2(1.0, 0.9)) - 0.8);
  float shine = smoothstep(0.35, 0.0, length(p - vec2(-0.28, 0.3))) * 0.5;
  vec3 ink = sky(vec3(0.34, 0.32, 0.68), vec3(0.3, 0.3, 0.64)) + shine;
  return vec4(ink * drop * alpha, drop * alpha);
}`,
  behavior: toss({ burst: 5, rate: 0.4, speed: [140, 260], spread: 1.3, gravity: 900, drag: 0.6, size: [3, 7], life: [0.6, 1] }),
}
