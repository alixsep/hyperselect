import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const pencil: Preset = {
  name: 'pencil',
  pad: [22, 14, 14],
  tint: [0.62, 0.64, 0.7],
  selection: { dark: 'color:#f6f7fa', light: 'color:#15171c' },
  surface: /* glsl */ `${studio}
float rule(vec2 p, vec2 a, vec2 b, float progress) {
  float along = clamp(dot(p - a, b - a) / dot(b - a, b - a), 0.0, 1.0);
  return stroke(segment(p, a, b), 0.45) * smoothstep(0.0, 0.03, progress - along);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  vec4 c = vec4(sky(vec3(0.14, 0.15, 0.18), vec3(0.985, 0.98, 0.965)), 1.0) * solid(d) * smoothstep(0.0, 0.15, age) * 0.9;
  float q = world.x + world.y * 0.8;
  float idx = floor(q / 3.4);
  float wobble = (noise(vec2(idx, world.y * 0.05)) - 0.5) * 1.2;
  float hatch = smoothstep(0.9, 0.25, abs(mod(q + wobble, 3.4) - 1.7));
  float pressure = 0.45 + 0.55 * noise(vec2(idx * 0.3, seed));
  float reach = solid(d + (hash(vec2(idx, seed)) - 0.4) * 5.0);
  float graphite = smoothstep(0.25, 0.6, tooth(world * 1.5));
  float hatched = smoothstep(0.0, 6.0, age * 1400.0 - local.x - hs.x - (local.y + hs.y) * 0.8);
  vec3 lead = sky(vec3(0.62, 0.64, 0.7), vec3(0.32, 0.33, 0.37));
  c = over(c, lead, hatch * pressure * reach * graphite * hatched * mix(0.4, 0.32, uLight));
  float progress = clamp(age * 2.2 - 0.15, 0.0, 1.0);
  vec2 j = (hash2(vec2(seed, 1.0)) - 0.5) * 2.0;
  vec2 k = (hash2(vec2(seed, 2.0)) - 0.5) * 2.0;
  float frame = rule(local, vec2(-hs.x - 7.0, -hs.y + j.x), vec2(hs.x + 8.0, -hs.y + j.y), progress);
  frame += rule(local, vec2(-hs.x - 5.0, hs.y + k.x), vec2(hs.x + 7.0, hs.y + k.y), progress);
  frame += rule(local, vec2(-hs.x + j.y, -hs.y - 6.0), vec2(-hs.x + k.x, hs.y + 5.0), progress);
  frame += rule(local, vec2(hs.x + k.y, -hs.y - 5.0), vec2(hs.x + j.x, hs.y + 6.0), progress);
  c = over(c, lead, clamp(frame, 0.0, 1.0) * graphite * mix(0.75, 0.7, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
