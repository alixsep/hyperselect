import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const synthwave: Preset = {
  name: 'synthwave',
  pad: [18, 12, 14],
  tint: [1, 0.35, 0.7],
  selection: { dark: 'color:#fff4fb;text-shadow:0 0 6px rgb(255 80 200 / .55)', light: 'color:#2a0830' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float horizon = hs.y * 0.25;
  float y = smoothstep(-hs.y, horizon, local.y);
  vec3 dusk = sky(mix(vec3(0.08, 0.03, 0.16), vec3(0.3, 0.06, 0.24), y), mix(vec3(0.98, 0.88, 1.0), vec3(1.0, 0.8, 0.86), y));
  vec4 c = vec4(dusk, 1.0) * body * 0.95;
  vec2 sun = vec2(hs.x * 0.55 + sin(seed * 9.0) * hs.x * 0.2, horizon);
  float radius = hs.y * 1.3 + 4.0;
  vec2 s = local - sun;
  float disc = solid(length(s) - radius) * step(s.y, 0.0);
  float band = s.y + radius * 0.55;
  float stripes = step(0.0, band) * step(fract(band / 4.0), min(band / radius, 0.6) * 0.8);
  vec3 sunColor = mix(sky(vec3(1.0, 0.8, 0.3), vec3(1.0, 0.7, 0.3)), sky(vec3(1.0, 0.25, 0.55), vec3(1.0, 0.45, 0.65)), smoothstep(-radius, 0.0, s.y));
  c = over(c, sunColor, disc * (1.0 - stripes) * body * mix(0.4, 0.55, uLight));
  float depth = local.y - horizon;
  vec2 floorUV = vec2(local.x / (depth + 1.0) * 1.4, 36.0 / (depth + 1.0) + t * 1.6);
  float floorLines = lattice(floorUV) * step(0.0, depth) * smoothstep(0.0, 5.0, depth);
  vec3 neon = sky(vec3(1.0, 0.3, 0.85), vec3(0.85, 0.15, 0.6));
  c = over(c, neon, floorLines * body * 0.7);
  float glow = exp(-abs(depth) / 1.5);
  c = over(c, sky(vec3(1.0, 0.55, 0.8), vec3(1.0, 0.35, 0.6)), glow * body * 0.6);
  c = over(c, sky(vec3(0.3, 0.85, 1.0), vec3(0.2, 0.55, 0.9)), stroke(d + 0.5, 0.45) * body * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
