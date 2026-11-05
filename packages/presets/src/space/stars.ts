import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const stars: Preset = {
  name: 'stars',
  pad: [12, 8, 8],
  tint: [0.72, 0.8, 1],
  selection: { dark: 'color:#f3f5ff', light: 'color:#f3f5ff' },
  surface: /* glsl */ `${cosmos}
float twinkle(float phase, float t) {
  return 0.72 + 0.28 * sin(t * (1.1 + 1.6 * phase) + phase * 40.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(-24.0, 0.0, age * 1600.0 - hs.x - local.x);
  if (inside <= 0.0) return vec4(0.0);
  vec3 sky = voidColor() + vec3(0.01, 0.014, 0.035) * smoothstep(hs.y, -hs.y, local.y);
  vec3 rgb = sky;
  vec2 drift = world + vec2(t * 1.5, 0.0);
  vec4 dust = starCell(drift, 7.0, seed);
  float dustOn = step(0.62, dust.z) * smoothstep(dust.z * 1.3, dust.z * 1.3 + 0.4, age);
  rgb += starHue(dust.w) * point(dust.xy, 0.15) * dustOn * 0.55 * twinkle(dust.w, t);
  vec4 s = starCell(drift, 23.0, seed + 1.0);
  float on = step(0.45, s.z) * smoothstep(0.15 + s.w * 0.9, 0.45 + s.w * 0.9, age);
  float size = 0.35 + 0.9 * s.z * s.z;
  float glow = exp(-dot(s.xy, s.xy) / (size * 6.0)) * 0.35;
  rgb += starHue(s.w) * (point(s.xy, size) + glow) * on * twinkle(s.w, t);
  vec4 b = starCell(drift, 61.0, seed + 2.0);
  float bright = step(0.55, b.z) * smoothstep(0.3 + b.w * 0.8, 0.8 + b.w * 0.8, age);
  vec2 q = abs(b.xy);
  float spikes = (exp(-q.y * 1.6) * exp(-q.x * 0.22) + exp(-q.x * 1.6) * exp(-q.y * 0.22)) * 0.55;
  float flare = point(b.xy, 1.1) + exp(-dot(b.xy, b.xy) * 0.12) * 0.5 + spikes;
  rgb += mix(starHue(b.w), vec3(1.0), 0.4) * flare * bright * twinkle(b.w + 0.5, t * 0.7);
  float rim = smoothstep(1.5, 0.0, abs(d + 0.75)) * 0.06;
  rgb += vec3(0.6, 0.7, 1.0) * rim;
  float a = voidAlpha();
  return sealed(rgb * inside, a * inside) * fade;
}`,
}
