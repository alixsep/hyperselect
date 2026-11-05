import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const stripes: Preset = {
  name: 'stripes',
  pad: [10, 4, 6],
  tint: [0.42, 0.42, 0.98],
  selection: { dark: 'color:#f2f3ff', light: 'color:#14164a' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float box = solid(sdRBox(local, hs, 3.0));
  if (box <= 0.0) return vec4(0.0);
  float period = 7.0;
  float s = (world.x + world.y - t * 5.0) / period;
  float f = abs(fract(s) - 0.5) * period;
  float order = (local.x + hs.x) / (2.0 * hs.x);
  float grow = easeOut(age * 2.6 - order * 0.9) * presence(fade);
  float w = 1.3 * grow;
  float aa = fwidth(s) * period * 0.7;
  float bar = smoothstep(w + aa, w - aa, f) * step(0.01, grow);
  vec3 ink = mix(vec3(0.5, 0.52, 1.0), vec3(0.36, 0.37, 0.92), uLight);
  vec4 c = vec4(ink, 1.0) * grow * mix(0.12, 0.1, uLight);
  c = over(c, ink, bar * mix(0.6, 0.42, uLight));
  return c * box;
}`,
}
