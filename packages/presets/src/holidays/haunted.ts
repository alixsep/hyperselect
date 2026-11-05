import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const haunted: Preset = {
  name: 'haunted',
  pad: [24, 20, 18],
  tint: [0.72, 0.78, 0.95],
  selection: { dark: 'color:#f2f5ff;text-shadow:0 1px 3px rgb(4 6 14 / .8)', light: 'color:#161a2a' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 8.0);
  if (fade < 0.001 || d > 18.0) return vec4(0.0);
  vec2 drift = vec2(t * 0.12, -t * 0.03);
  float mist = fbm(world * vec2(0.018, 0.045) + drift + seed * 5.0);
  float body = smoothstep(5.0, -6.0, d + (mist - 0.5) * 14.0) * smoothstep(0.0, 0.4, age);
  vec4 c = vec4(sky(vec3(0.09, 0.11, 0.17), vec3(0.9, 0.92, 0.96)), 1.0) * body * 0.9;
  float wisp = fbm3(world * vec2(0.03, 0.08) - drift * 1.6 + seed * 3.0);
  c = over(c, sky(vec3(0.55, 0.6, 0.75), vec3(1.0)), smoothstep(0.5, 0.85, wisp) * body * mix(0.3, 0.7, uLight));
  c = over(c, sky(vec3(0.0, 0.0, 0.04), vec3(0.62, 0.66, 0.78)), smoothstep(0.55, 0.3, mist) * body * 0.2);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = p;
  q.x += sin(q.y * 3.0 + t * 3.0 + seed * 10.0) * 0.06 * (0.3 - q.y);
  float head = length(q - vec2(0.0, 0.2)) - 0.45;
  float hem = -0.75 + 0.1 * sin(q.x * 14.0 - t * 8.0 + seed * 6.0);
  float skirt = max(max(abs(q.x) - 0.45 - (0.2 - q.y) * 0.08, q.y - 0.2), hem - q.y);
  float ghost = solid(min(head, skirt));
  float eyes = solid(length(vec2(abs(q.x) - 0.16, q.y - 0.28) * vec2(1.0, 0.7)) - 0.08);
  float mouth = solid(length((q - vec2(0.0, 0.04)) * vec2(1.4, 1.0)) - 0.07);
  vec3 sheet = sky(vec3(0.92, 0.95, 1.0), vec3(0.7, 0.74, 0.88));
  vec3 color = mix(sheet, sky(vec3(0.08, 0.08, 0.16), vec3(0.14, 0.14, 0.24)), max(eyes, mouth));
  float a = ghost * alpha * mix(0.82, 0.95, uLight) * (0.55 + 0.45 * smoothstep(-0.85, -0.2, q.y));
  return vec4(color * a, a);
}`,
  behavior: rise({ rate: 0.3, speed: [16, 32], wobble: 14, size: [18, 26], life: [1.8, 2.8] }),
}
