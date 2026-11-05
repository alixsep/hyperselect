import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const bloom: Preset = {
  name: 'bloom',
  pad: [30, 22, 24],
  tint: [1.0, 0.7, 0.68],
  selection: { dark: 'color:#2b1320', light: 'color:#2b1320' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 0.0);
  float d = sdRBox(local, hs, 8.0);
  if (d > 30.0) return vec4(0.0);
  float swell = (age - 0.32) / 0.2;
  float expose = easeOut(age * 3.2) + 0.45 * exp(-swell * swell);
  float e = expose * (0.96 + 0.04 * sin(t * 1.3 + seed * 6.0));
  float inside = smoothstep(2.5, -2.5, d);
  float od = max(d, 0.0);
  float tight = exp(-od / 3.5) * (1.0 - inside);
  float mid = exp(-od / 9.0);
  float wide = exp(-od / 22.0);
  float heart = exp(-local.y * local.y / (hs.y * hs.y) * 1.5) * smoothstep(hs.x + 10.0, hs.x - 40.0, abs(local.x));
  vec3 hot = vec3(1.0, 0.97, 0.93), peach = vec3(1.0, 0.82, 0.74), rose = vec3(1.0, 0.6, 0.62), lilac = vec3(0.62, 0.52, 1.0);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.78, 0.72, 1.0), 1.0) * clamp(wide * 0.3 * e, 0.0, 1.0);
    c = over(c, vec3(1.0, 0.72, 0.72), clamp((mid * 0.45 + tight * 0.3) * e, 0.0, 1.0));
    c = over(c, mix(vec3(1.0, 0.86, 0.82), vec3(1.0, 0.95, 0.92), heart), inside * clamp(e, 0.0, 1.0) * 0.9);
    return c * fade;
  }
  vec3 core = mix(peach, hot, heart);
  vec3 rgb = core * inside * 0.86 + (rose * (mid * 0.42 + tight * 0.15) + lilac * wide * 0.3) * (1.0 - inside * 0.8);
  rgb *= e;
  return vec4(rgb * fade, inside * 0.86 * min(e, 1.0) * fade);
}`,
}
