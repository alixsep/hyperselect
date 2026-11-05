import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { screen, tone } from './shared'

export const vaporwave: Preset = {
  name: 'vaporwave',
  pad: [20, 40, 14],
  tint: [0.95, 0.55, 0.85],
  selection: { dark: 'color:#fff6fc', light: 'color:#2a1030' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float diagonal = clamp((local.x / max(hs.x, 1.0) + local.y / max(hs.y, 1.0) * 0.4) * 0.5 + 0.5, 0.0, 1.0);
  vec3 pastel = sky(mix(vec3(0.2, 0.08, 0.26), vec3(0.05, 0.16, 0.26), diagonal), mix(vec3(1.0, 0.84, 0.94), vec3(0.8, 0.94, 1.0), diagonal));
  vec4 c = vec4(pastel, 1.0) * body * 0.94;
  vec2 cell = mod(world, 5.0) - 2.5;
  float amount = smoothstep(-hs.y, hs.y, local.y) * 0.9;
  float halftone = solid(length(cell) - amount * 1.6);
  c = over(c, sky(vec3(0.95, 0.45, 0.85), vec3(0.95, 0.55, 0.85)), halftone * body * 0.22);
  vec2 sun = local - vec2(-hs.x * 0.35 + sin(seed * 7.0) * hs.x * 0.3, -hs.y * 0.2);
  float disc = exp(-dot(sun, sun) / (hs.y * hs.y * 3.0 + 40.0));
  c = over(c, sky(vec3(1.0, 0.6, 0.45), vec3(1.0, 0.75, 0.6)), disc * body * 0.3);
  float sweep = smoothstep(0.02, 0.0, abs(fract((local.x - local.y * 2.0) / 140.0 - t * 0.12) - 0.5) - 0.48);
  c = over(c, vec3(1.0), sweep * body * 0.18);
  c = over(c, sky(vec3(0.45, 0.95, 1.0), vec3(0.3, 0.7, 0.95)), stroke(d + 0.6, 0.5) * body * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
float triangle(vec2 p) {
  p.x = abs(p.x) - 0.6;
  p.y += 0.3464;
  if (p.x + 1.7320508 * p.y > 0.0) p = vec2(p.x - 1.7320508 * p.y, -1.7320508 * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -1.2, 0.0);
  return -length(p) * sign(p.y);
}

vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = mat2(cos(t + seed * 6.0), -sin(t + seed * 6.0), sin(t + seed * 6.0), cos(t + seed * 6.0)) * p;
  float line;
  if (kind < 0.5) line = abs(triangle(q * 1.2)) - 0.06;
  else if (kind < 1.5) line = abs(length(q) - 0.6) - 0.08;
  else {
    float box = max(abs(q.x), abs(q.y)) - 0.55;
    float checks = step(0.0, sin(q.x * 9.0) * sin(q.y * 9.0));
    line = checks > 0.5 ? box : max(box, -box - 0.1);
  }
  float shape = solid(line);
  vec3 c = mix(vec3(1.0, 0.55, 0.85), vec3(0.45, 0.9, 1.0), seed);
  c = sky(c, c * 0.8);
  return vec4(c * shape * alpha, shape * alpha * 0.9);
}`,
  behavior: rise({ rate: 0.9, speed: [14, 26], wobble: 8, size: [14, 20], life: [2.2, 3.2], variants: 3 }),
}
