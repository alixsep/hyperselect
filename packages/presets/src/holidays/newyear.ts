import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const newyear: Preset = {
  name: 'newyear',
  pad: [20, 18, 16],
  tint: [0.95, 0.78, 0.4],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(0 2 14 / .7)', light: 'color:#1e1606' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.03, 0.04, 0.1), vec3(0.99, 0.96, 0.88)), 1.0) * body * 0.93;
  vec3 gold = sky(vec3(0.98, 0.8, 0.45), vec3(0.72, 0.52, 0.16));
  float sheen = 0.75 + 0.25 * cos(atan(local.y, local.x / max(hs.x / hs.y, 1.0)) * 2.0 + 1.0);
  c = over(c, gold * sheen, stroke(d + 1.4, 0.45) * body * 0.85);
  c = over(c, gold, stroke(d + 3.4, 0.25) * body * 0.35);

  vec2 g = world / 5.0 + seed * 17.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5 - (hash2(id) - 0.5) * 0.5;
  float fleck = solid(length(f) * 5.0 - mix(0.4, 0.9, hash(id + 3.0))) * step(0.84, hash(id));
  float near = smoothstep(-11.0, -3.0, d) * smoothstep(0.0, 0.3, age - hash(id + 7.0) * 0.4);
  float twinkle = 0.5 + 0.5 * pow(max(sin(t * 2.5 + hash(id + 1.0) * 40.0), 0.0), 4.0);
  c = over(c, gold * (0.8 + 0.4 * twinkle), fleck * near * body);
  c.rgb += vec3(1.0, 0.85, 0.5) * fleck * near * body * twinkle * (1.0 - uLight) * 0.4;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec3 color = sky(vec3(1.0, 0.92, 0.7), vec3(0.7, 0.52, 0.18));
  if (kind > 0.5) {
    float g = clamp(glint(p, 0.9), 0.0, 1.0) * alpha;
    return vec4(color * g, g * mix(0.0, 0.9, uLight));
  }
  float r = length(p);
  float a = (solid(abs(r - 0.72) - 0.1) * 0.8 + solid(r - 0.72) * 0.12 + solid(length(p - vec2(-0.28, 0.3)) - 0.16) * 0.9) * alpha;
  return vec4(color * a, a * mix(0.6, 0.9, uLight));
}`,
  behavior: rise({ rate: 1.3, speed: [30, 60], wobble: 5, size: [3, 6], life: [0.8, 1.4], variants: 2 }),
}
