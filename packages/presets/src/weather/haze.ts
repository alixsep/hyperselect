import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { atmosphere } from './shared'
import { motes } from './sprites'

export const haze: Preset = {
  name: 'haze',
  pad: [36, 40, 26],
  tint: [0.95, 0.72, 0.45],
  selection: { dark: 'color:#fff6ea', light: 'color:#2c1d0e' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 1.5);
  float d = sdRBox(local, hs, 9.0);
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.8, age);
  float body = 1.0 - smoothstep(-4.0, 22.0, d + (fbm3(world * 0.03 + t * 0.05) - 0.5) * 16.0);
  vec2 sun = vec2(-hs.x - 40.0, -hs.y - 60.0);
  vec2 ray = local - sun;
  float angle = atan(ray.y, ray.x);
  float beams = pow(noise(vec2(angle * 26.0 + seed * 9.0, t * 0.12)), 2.5) * 0.7 + pow(noise(vec2(angle * 61.0 - seed, t * 0.2)), 4.0) * 0.5;
  float falloff = smoothstep(hs.x * 2.6 + 80.0, 0.0, length(ray));
  vec3 dusk = sky(mix(vec3(0.24, 0.13, 0.06), vec3(0.14, 0.08, 0.08), smoothstep(-hs.y, hs.y, local.y)), mix(vec3(1.0, 0.9, 0.76), vec3(0.98, 0.86, 0.8), smoothstep(-hs.y, hs.y, local.y)));
  vec4 c = vec4(dusk, 1.0) * body * 0.88 * open;
  c = over(c, sky(vec3(1.0, 0.72, 0.38), vec3(1.0, 0.95, 0.85)), clamp(beams * falloff, 0.0, 1.0) * body * 0.45 * open);
  float grain = noise(world * 0.8 + t * 3.0) - 0.5;
  c.rgb += grain * 0.025 * body;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.8, fade);
}`,
  sprite: motes([1, 0.82, 0.55], [0.82, 0.55, 0.25]),
  behavior: drift({ density: 3, wind: 8, fall: -5, gust: 18, size: [3, 7], life: [2.5, 5], reach: 26 }),
}
