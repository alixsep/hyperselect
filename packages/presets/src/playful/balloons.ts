import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const balloons: Preset = {
  name: 'balloons',
  pad: [22, 60, 18],
  tint: [1, 0.5, 0.6],
  selection: { dark: 'color:#fff7f2', light: 'color:#2a1616' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float tilt = smoothstep(-hs.x, hs.x, local.x);
  vec4 c = vec4(sky(mix(vec3(0.12, 0.1, 0.24), vec3(0.24, 0.1, 0.2), tilt), mix(vec3(0.88, 0.93, 1.0), vec3(1.0, 0.9, 0.93), tilt)), 1.0) * body * 0.9;
  float ribbon = sin(world.x * 0.12 + t * 2.0 + seed * 7.0) * 1.5;
  float curl = stroke(local.y - hs.y + 3.0 + ribbon, 0.6) * body;
  c = over(c, sky(vec3(1.0, 0.75, 0.5), vec3(0.95, 0.5, 0.55)), curl * 0.6);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 b = (p - vec2(0.0, 0.32)) / vec2(0.4, 0.5);
  float r = length(b * vec2(1.0, 1.0 + max(-b.y, 0.0) * 0.25));
  float balloon = solid(r - 1.0);
  float knot = solid(max(abs(p.x) - 0.06 - (p.y + 0.3) * 0.5, abs(p.y + 0.24) - 0.06));
  float x = sin(p.y * 9.0 + t * 3.0 + seed * 9.0) * 0.06 * (-0.3 - p.y);
  float string = smoothstep(0.022, 0.0, abs(p.x - x)) * step(p.y, -0.24) * smoothstep(-1.0, -0.8, p.y);
  vec2 s = b - vec2(-0.4, 0.45);
  float gloss = smoothstep(0.35, 0.0, length(s * vec2(1.0, 0.6)));
  vec3 color = candy(seed);
  vec3 c = color * (0.78 + 0.3 * smoothstep(-1.0, 0.6, b.y) - 0.2 * smoothstep(0.6, 1.0, r)) + gloss * 0.5;
  vec3 thread = sky(vec3(0.85), vec3(0.45));
  float a = max(max(balloon, knot), string * 0.8);
  vec3 rgb = c * max(balloon, knot) + thread * string * 0.8 * (1.0 - balloon);
  return vec4(rgb * alpha, a * alpha);
}`,
  behavior: rise({ rate: 0.45, speed: [38, 60], wobble: 10, size: [30, 40], life: [2.4, 3.4] }),
}
