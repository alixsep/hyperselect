import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const watercolor: Preset = {
  name: 'watercolor',
  pad: [20, 16, 18],
  tint: [0.3, 0.72, 0.74],
  selection: { dark: 'color:#f4fbfb', light: 'color:#122428' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 18.0) return vec4(0.0);
  float wet = fbm3(world * 0.03 + seed * 9.0);
  float edge = d + (wet - 0.5) * 8.0;
  float front = age * 900.0 - local.x - hs.x + (wet - 0.5) * 60.0;
  float stain = solid(edge) * smoothstep(0.0, 14.0, front);
  float blend = smoothstep(0.3, 0.7, noise(world * 0.012 + seed * 5.0));
  vec3 pigment = mix(sky(vec3(0.05, 0.29, 0.31), vec3(0.6, 0.86, 0.84)), sky(vec3(0.15, 0.16, 0.4), vec3(0.74, 0.77, 0.95)), blend);
  float bloom = noise(world * 0.04 + seed * 3.0);
  float pushed = smoothstep(0.58, 0.64, bloom);
  float tide = smoothstep(0.05, 0.0, abs(bloom - 0.64));
  float density = 0.72 + wet * 0.2 - pushed * 0.18 + tide * 0.14 + (tooth(world * 0.7) - 0.5) * 0.16;
  float rim = clamp(smoothstep(-5.0, 0.0, edge) + smoothstep(18.0, 0.0, front) * 0.6, 0.0, 1.0);
  vec4 c = vec4(pigment, 1.0) * stain * density;
  c = over(c, pigment * sky(vec3(1.5), vec3(0.7)), rim * stain * 0.45);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
