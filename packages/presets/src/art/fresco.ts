import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const fresco: Preset = {
  name: 'fresco',
  pad: [18, 14, 14],
  tint: [0.88, 0.58, 0.42],
  selection: { dark: 'color:#fff7f0', light: 'color:#2a140a' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs) + (noise(world * 0.2) - 0.5) * 2.0;
  if (fade < 0.001 || d > 6.0) return vec4(0.0);
  vec3 v = voronoi(world * 0.045 + seed * 3.0);
  float crack = smoothstep(0.05, 0.0, v.y - v.x);
  float plastered = smoothstep(v.z * 0.5, v.z * 0.5 + 0.2, age * 1.6);
  float mottle = fbm3(world * 0.02 + seed);
  float loss = smoothstep(0.64, 0.68, fbm(world * 0.03 + seed * 11.0));
  vec3 plaster = sky(vec3(0.3, 0.27, 0.22), vec3(0.95, 0.92, 0.85));
  vec3 pigment = mix(sky(vec3(0.38, 0.16, 0.11), vec3(0.95, 0.77, 0.64)), sky(vec3(0.32, 0.23, 0.1), vec3(0.94, 0.85, 0.64)), smoothstep(0.35, 0.65, mottle));
  vec3 color = mix(pigment, plaster, loss * 0.8) * (0.94 + 0.12 * tooth(world * 0.5));
  color = mix(color, sky(vec3(0.14, 0.09, 0.07), vec3(0.62, 0.5, 0.42)), crack * 0.55);
  vec4 c = vec4(color, 1.0) * solid(d) * plastered * 0.95;
  float band = stroke(abs(local.y) - hs.y + 2.5, 0.7) * step(abs(local.x), hs.x - 2.0);
  c = over(c, sky(vec3(0.72, 0.5, 0.2), vec3(0.62, 0.26, 0.15)), band * plastered * (1.0 - loss * 0.7) * 0.8);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
