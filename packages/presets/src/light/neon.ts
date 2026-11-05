import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const neon: Preset = {
  name: 'neon',
  pad: [22, 16, 18],
  tint: [1.0, 0.2, 0.58],
  selection: { dark: 'color:#fff2f8;text-shadow:0 0 8px rgb(255 40 140 / .7)', light: 'color:#45061f' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, -3.0);
  float d = sdRBox(local, hs, hs.y);
  if (d > 22.0) return vec4(0.0);
  float ad = abs(d);
  float run = age * 1100.0 - abs(local.x);
  float lit = smoothstep(0.0, 24.0, run);
  float gapX = -hs.x + 22.0 + seed * 50.0;
  float gap = 1.0 - smoothstep(4.5, 3.0, length(vec2(local.x - gapX, max(local.y, 0.0) * 0.4))) * step(0.0, local.y);
  lit *= gap;
  float front = exp(-abs(run - 6.0) / 8.0 - abs(d) / 4.0) * (1.0 - smoothstep(0.0, 0.25, age - hs.x / 1100.0));
  float hum = 0.95 + 0.05 * sin(t * 1.6 + seed * 6.0);
  float w = 1.9;
  float tube = stroke(d, w);
  float core = clamp(1.0 - ad / w, 0.0, 1.0);
  float halo = exp(-ad / 3.0) * 0.6 + exp(-ad / 11.0) * 0.28;
  float inside = solid(d);
  float wash = inside * (0.05 + 0.06 * smoothstep(-hs.y, hs.y, local.y));
  vec3 pink = vec3(1.0, 0.14, 0.52), violet = vec3(0.6, 0.12, 1.0), white = vec3(1.0, 0.86, 0.94);
  if (uLight > 0.5) {
    vec3 rose = vec3(1.0, 0.7, 0.86), magenta = vec3(0.84, 0.05, 0.44);
    vec4 c = vec4(rose, 1.0) * clamp((halo * 0.75 + inside * 0.22) * lit * hum, 0.0, 1.0);
    c = over(c, mix(magenta, vec3(1.0, 0.8, 0.92), core * core * 0.8), tube * lit);
    c = over(c, rose, clamp(front, 0.0, 1.0) * 0.8);
    return c * fade;
  }
  vec3 rgb = (white * core * tube * 1.3 + pink * (tube * 0.7 + halo) + mix(pink, violet, 0.55) * wash) * lit * hum;
  rgb += white * front;
  return vec4(rgb * fade, inside * 0.3 * lit * fade);
}`,
}
