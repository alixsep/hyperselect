import type { Preset } from 'hyperselect'
import { atmosphere } from './shared'

export const fog: Preset = {
  name: 'fog',
  pad: [44, 30, 30],
  tint: [0.72, 0.76, 0.8],
  selection: {
    dark: 'color:#f4f6f8;text-shadow:0 0 12px rgb(200 210 220 / .45)',
    light: 'color:#1e2329;text-shadow:0 0 10px rgb(255 255 255 / .9)',
  },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float d = sdRBox(local, hs, min(hs.y, 14.0));
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 1.2, age);
  vec2 p = world * vec2(0.012, 0.03) + seed * 5.0;
  float low = billow(p, t * 1.2);
  float high = fbm3(world * vec2(0.03, 0.06) - vec2(t * 0.35, 0.0) + seed);
  float bank = 1.0 - smoothstep(-24.0, 26.0, d + (0.5 - low) * 40.0);
  float wisps = smoothstep(0.42, 0.75, high) * (1.0 - smoothstep(-6.0, 34.0, d));
  vec3 gray = sky(vec3(0.42, 0.46, 0.5), vec3(0.8, 0.83, 0.86));
  vec3 shade = sky(vec3(0.24, 0.27, 0.31), vec3(0.66, 0.7, 0.75));
  vec4 c = vec4(mix(shade, gray, low), 1.0) * bank * mix(0.5, 0.85, low) * open;
  c = over(c, sky(vec3(0.62, 0.66, 0.7), vec3(0.88, 0.9, 0.92)), wisps * 0.55 * open);
  float lamp = exp(-length((local - vec2(-hs.x + 18.0, -hs.y * 0.3)) * vec2(0.03, 0.05)));
  c += vec4(sky(vec3(0.55, 0.42, 0.22), vec3(0.0)), 0.0) * lamp * bank * open * 0.6;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.8, fade);
}`,
}
