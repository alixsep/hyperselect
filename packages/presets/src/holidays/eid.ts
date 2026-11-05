import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const eid: Preset = {
  name: 'eid',
  pad: [22, 36, 12],
  tint: [0.92, 0.76, 0.38],
  selection: { dark: 'color:#f4fffc;text-shadow:0 1px 2px rgb(0 18 18 / .7)', light: 'color:#06261f' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 20.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.02, 0.11, 0.12), vec3(0.9, 0.97, 0.95)), 1.0) * body * 0.93;
  vec3 gold = sky(vec3(0.95, 0.78, 0.4), vec3(0.7, 0.52, 0.14));
  vec2 q = (fract(world / 16.0) - 0.5) * 16.0;
  float star8 = min(sdBox(q, vec2(4.2)), sdBox(rotate(q, PI * 0.25), vec2(4.2)));
  float tie = min(abs(q.x), abs(q.y)) + max(5.6 - max(abs(q.x), abs(q.y)), 0.0) * 9.0;
  float pattern = min(abs(star8), tie);
  float traced = smoothstep(0.0, 0.5, age * 1.2 - hash(floor(world / 16.0)) * 0.5);
  c = over(c, gold, stroke(pattern, 0.35) * body * traced * mix(0.1, 0.42, smoothstep(-10.0, -1.0, d)));
  c = over(c, gold, stroke(d + 1.2, 0.4) * body * 0.85);

  float first = (1.0 - cover) * step(40.0, hs.x) * smoothstep(0.0, 0.4, age - 0.2);
  vec2 m = local - vec2(hs.x - 12.0, -hs.y - 11.0);
  float crescent = max(length(m) - 6.0, -(length(m - vec2(2.6, -1.8)) - 5.0));
  vec2 s = local - vec2(hs.x - 3.5, -hs.y - 14.0);
  float twinkle = 0.85 + 0.15 * sin(t * 2.0 + seed * 9.0);
  float shape = min(crescent, star(vec2(s.x, -s.y), 2.6 * twinkle, 0.42, 5.0));
  c.rgb += vec3(1.0, 0.82, 0.45) * exp(-max(shape, 0.0) / 3.0) * first * (1.0 - uLight) * 0.35;
  c = over(c, gold * (1.0 + 0.2 * smoothstep(3.0, -3.0, m.x + m.y)), solid(shape) * first);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
