import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const rainbow: Preset = {
  name: 'rainbow',
  pad: [12, 8, 18],
  tint: [0.98, 0.56, 0.62],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 3px rgb(10 8 20 / .85)', light: 'color:#1f1a33' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float sag = min(12.0, hs.x * 0.06);
  float radius = hs.x * hs.x / (2.0 * sag) + sag;
  float v = radius - length(local - vec2(0.0, radius));
  float band = (v + hs.y) / (2.0 * hs.y);
  if (band < -0.2 || band > 1.3) return vec4(0.0);
  float span = smoothstep(-0.02, 0.06, band) * smoothstep(1.06, 0.96, band);
  float ends = smoothstep(hs.x + 4.0, hs.x - 36.0, abs(local.x));
  float drawn = smoothstep(0.0, 90.0, age * 1100.0 - (local.x + hs.x));
  float mist = 0.82 + 0.18 * fbm3(world * vec2(0.012, 0.03) + vec2(t * 0.08, seed * 7.0));
  float extra = smoothstep(1.0, 1.08, band) * smoothstep(1.3, 1.12, band) * 0.35;
  vec3 hue = spectrum(clamp(band, 0.0, 1.0) * 0.76);
  float k = (span + extra) * ends * drawn * mist;
  if (uLight > 0.5) {
    vec3 c = mix(hue, vec3(1.0), 0.18) * 0.96;
    float a = k * 0.5;
    return vec4(c * a, a) * fade;
  }
  vec3 c = mix(hue, vec3(1.0), 0.28);
  return vec4(c * k * 0.5 * fade, k * 0.28 * fade);
}`,
}
