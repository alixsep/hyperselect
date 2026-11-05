import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const ultraviolet: Preset = {
  name: 'ultraviolet',
  pad: [10, 8, 8],
  tint: [0.55, 0.2, 1],
  selection: { dark: 'color:#e9ff7a;text-shadow:0 0 6px rgb(120 40 255 / .7)', light: 'color:#1e0840' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (d > 8.0) return vec4(0.0);
  float inside = solid(d);
  float strike = smoothstep(0.0, 12.0, age * 900.0 - abs(local.x));
  float depth = local.y + hs.y;
  float fall = smoothstep(0.0, 1.0, age * 2.0 - depth / (2.0 * hs.y));
  float tube = stroke(local.y + hs.y - 1.0, 1.0) * strike * (1.0 - cover) * step(abs(local.x), hs.x - 2.0);
  float wash = (0.55 + 0.45 * exp(-depth / mix(14.0, 40.0, cover))) * fall * strike;
  vec2 cell = floor(world / 5.0);
  float h = hash(cell + seed * 13.0);
  float k = hash(cell + 7.7);
  float speck = step(h, 0.06) * inside * fall * (0.5 + 0.5 * sin(t * 1.2 + k * 40.0));
  vec2 f = fract(world / 5.0) - 0.5;
  speck *= smoothstep(0.42, 0.1, length(f));
  vec3 glowCol = k < 0.33 ? vec3(0.4, 1.0, 0.95) : k < 0.66 ? vec3(0.8, 1.0, 0.3) : vec3(1.0, 0.4, 0.85);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.66, 0.52, 0.95), 1.0) * inside * 0.55 * wash;
    c = over(c, glowCol * 0.6, speck * 0.8);
    c = over(c, vec3(0.42, 0.18, 0.86), tube);
    return c * fade;
  }
  vec3 violet = vec3(0.28, 0.06, 0.62);
  vec3 rgb = violet * inside * wash + glowCol * speck * 1.2 + vec3(0.75, 0.6, 1.0) * tube * 1.4 + vec3(0.5, 0.2, 1.0) * exp(-depth / 4.0) * strike * (1.0 - cover) * 0.5;
  return vec4(rgb, inside * wash * 0.55) * fade;
}`,
}
