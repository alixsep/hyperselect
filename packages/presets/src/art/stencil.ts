import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const stencil: Preset = {
  name: 'stencil',
  pad: [20, 14, 14],
  tint: [0.92, 0.48, 0.38],
  selection: { dark: 'color:#fff6f2', light: 'color:#2a0e06' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float bridge = mod(local.x + hs.x + 23.0, 46.0) - 23.0;
  float cut = max(d, 1.6 - abs(bridge));
  float sprayed = sweep(local.x, hs, age, 900.0, 40.0);
  float density = (0.84 + 0.16 * fbm(world * 0.03 + seed)) * sprayed;
  float halo = exp(-max(cut, 0.0) / 3.0) * step(0.0, cut);
  float mist = step(hash(floor(world) + seed), halo * 0.35);
  vec3 paint = sky(vec3(0.5, 0.17, 0.12), vec3(1.0, 0.72, 0.6));
  vec4 c = vec4(paint, 1.0) * mist * sprayed * 0.8;
  c = over(c, paint * (0.96 + 0.08 * tooth(world * 0.8)), smoothstep(0.6, -0.6, cut) * density);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
