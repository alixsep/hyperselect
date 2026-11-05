import type { Preset } from 'hyperselect'
import { atmosphere } from './shared'

export const clouds: Preset = {
  name: 'clouds',
  pad: [30, 48, 22],
  tint: [0.6, 0.76, 0.95],
  selection: { dark: 'color:#f5f8fc', light: 'color:#15202e' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 8.0);
  if (fade < 0.001 || d > 48.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.9, age);
  float body = solid(d) * smoothstep(0.0, 0.3, age);
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec3 blue = sky(mix(vec3(0.1, 0.16, 0.3), vec3(0.06, 0.1, 0.2), depth), mix(vec3(0.62, 0.78, 0.96), vec3(0.78, 0.88, 0.98), depth));
  vec4 c = vec4(blue, 1.0) * body * 0.92;
  vec2 p = world * vec2(0.014, 0.022) + vec2(seed * 7.0 - t * 0.12, 0.0);
  float puff = billow(p, t * 0.6);
  float shade = billow(p + vec2(0.0, 0.09), t * 0.6);
  float rise = smoothstep(hs.y + 6.0, -hs.y - 40.0 * open, local.y);
  float towers = (puff - 0.42) * 2.4 + rise * 0.55 - 0.45 - max(abs(local.x) - hs.x, 0.0) * 0.05 - max(local.y - hs.y, 0.0) * 0.08;
  float cloud = smoothstep(-0.05, 0.3, towers) * open;
  float light = clamp(0.6 + (puff - shade) * 3.0 - max(local.y + hs.y, 0.0) * 0.006, 0.0, 1.0);
  vec3 lit = sky(vec3(0.82, 0.86, 0.96), vec3(1.0));
  vec3 under = sky(vec3(0.3, 0.34, 0.48), vec3(0.66, 0.73, 0.84));
  vec3 color = mix(under, lit, light);
  color += sky(vec3(0.95, 0.8, 0.6), vec3(1.0, 0.92, 0.82)) * smoothstep(0.0, 0.05, towers) * (1.0 - smoothstep(0.05, 0.2, towers)) * light * 0.25;
  c = over(c, color, cloud * 0.94);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
