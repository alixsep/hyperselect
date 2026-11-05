import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const outline: Preset = {
  name: 'outline',
  pad: [12, 6, 8],
  tint: [0.3, 0.88, 0.68],
  selection: { dark: 'color:#eafff6', light: 'color:#06372a' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.5);
  float d = sdRBox(local, hs, min(hs.y, 5.0));
  if (d > 2.0) return vec4(0.0);
  float span = 2.0 * hs.x + 4.0;
  float x = local.x + hs.x + 2.0;
  float head = easeOut(age * 1.8) * span;
  float tail = leaving(age, fade) * span;
  float drawn = smoothstep(head + 1.0, head - 1.0, x) * smoothstep(tail - 1.0, tail + 1.0, x);
  float closed = smoothstep(0.35, 0.8, age);
  vec3 ink = mix(vec3(0.38, 0.92, 0.72), vec3(0.05, 0.56, 0.4), uLight);
  float tip = smoothstep(14.0, 0.0, head - x) * (1.0 - closed);
  vec4 c = vec4(ink, 1.0) * solid(d) * closed * mix(0.08, 0.1, uLight);
  c = over(c, mix(ink, vec3(1.0), tip * 0.5 * (1.0 - uLight)), stroke(d, 0.7) * drawn);
  return c * presence(fade);
}`,
}
