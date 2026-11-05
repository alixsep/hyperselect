import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const pastel: Preset = {
  name: 'pastel',
  pad: [22, 16, 16],
  tint: [0.85, 0.62, 0.9],
  selection: { dark: 'color:#fff8fd', light: 'color:#24122a' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  vec2 s = rotate(world, 0.5);
  float streak = noise(vec2(s.x * 0.08, s.y * 0.6) + seed);
  float soft = smoothstep(7.0, -5.0, d + (streak - 0.5) * 10.0);
  float k = smoothstep(0.0, 1.0, local.x / max(hs.x, 1.0) * 0.5 + 0.5 + (fbm(world * 0.01 + seed) - 0.5) * 0.6);
  vec3 rose = sky(vec3(0.38, 0.2, 0.4), vec3(0.98, 0.8, 0.88));
  vec3 blue = sky(vec3(0.16, 0.27, 0.44), vec3(0.78, 0.88, 0.99));
  vec3 cream = sky(vec3(0.4, 0.3, 0.16), vec3(0.99, 0.92, 0.72));
  vec3 color = mix(mix(rose, blue, smoothstep(0.0, 0.55, k)), cream, smoothstep(0.55, 1.0, k));
  float grain = tooth(world * 1.2) + streak * 0.3;
  float pigment = smoothstep(0.2 + (1.0 - soft) * 0.7, 0.45 + (1.0 - soft) * 0.7, grain);
  float rubbed = sweep(local.x, hs, age, 900.0, 40.0);
  vec4 c = vec4(color, 1.0) * soft * rubbed * 0.55;
  c = over(c, color, pigment * soft * rubbed * 0.85);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
