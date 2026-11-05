import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const sunshower: Preset = {
  name: 'sunshower',
  pad: [26, 70, 20],
  tint: [0.98, 0.76, 0.36],
  selection: { dark: 'color:#fff8ea', light: 'color:#2a1e08' },
  surface: /* glsl */ `${atmosphere}
vec3 spectrum(float h) {
  return clamp(0.5 + 0.5 * cos(6.2832 * (h * 0.8 + vec3(0.0, 0.33, 0.67))), 0.0, 1.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 7.0);
  if (fade < 0.001 || d > 70.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.5, age);
  float body = solid(d) * open;
  vec2 sun = vec2(hs.x + 10.0, -hs.y - 30.0);
  float toSun = length(local - sun);
  vec3 warm = sky(mix(vec3(0.2, 0.12, 0.05), vec3(0.09, 0.07, 0.07), smoothstep(0.0, hs.x * 2.0, toSun)), mix(vec3(1.0, 0.92, 0.74), vec3(0.97, 0.93, 0.86), smoothstep(0.0, hs.x * 2.0, toSun)));
  vec4 c = vec4(warm, 1.0) * body * 0.9;
  c += vec4(sky(vec3(1.0, 0.7, 0.3), vec3(1.0, 0.82, 0.45)), 0.4) * exp(-toSun / 40.0) * body * 0.5;
  float radius = max(hs.x * 1.05, 60.0);
  float ring = (length(local - vec2(-hs.x * 0.2, hs.y + radius * 0.55)) - radius) / 16.0 + 0.5;
  float band = smoothstep(0.0, 0.3, ring) * smoothstep(1.0, 0.7, ring) * smoothstep(0.2, 1.4, age);
  c = over(c, mix(spectrum(ring), vec3(1.0), 0.35), band * mix(0.16, 0.22, uLight) * smoothstep(50.0, 20.0, d) * smoothstep(hs.y + 4.0, -hs.y, local.y));
  vec2 sheet = world - vec2(world.y * 0.1, 0.0);
  float drops = rain(sheet, t, vec2(9.0, 56.0), 520.0, 18.0, 0.35, 0.45, seed);
  float glint = pow(hash(vec2(floor(sheet.x / 9.0), floor((sheet.y - t * 520.0) / 56.0) + floor(t * 6.0))), 6.0);
  c = over(c, sky(vec3(1.0, 0.86, 0.58), vec3(0.72, 0.5, 0.16)), drops * (0.4 + glint) * open * solid(d - 62.0) * mix(0.55, 1.0, 1.0 - body));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([1, 0.88, 0.6], [0.72, 0.5, 0.18], [1, 0.97, 0.88]),
  behavior: rainfall({ density: 6, speed: 540, slant: 0.1, length: 16, splash: 2 }),
}
