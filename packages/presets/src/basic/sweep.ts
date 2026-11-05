import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const sweep: Preset = {
  name: 'sweep',
  pad: [10, 4, 6],
  tint: [0.1, 0.68, 0.8],
  selection: { dark: 'color:#ffffff', light: 'color:#03303a' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float span = 2.0 * hs.x + 16.0;
  float x = local.x + hs.x + 8.0 - local.y * 0.4;
  float head = easeOut(age * 2.0) * span;
  float tail = leaving(age, fade) * span;
  float d = max(sdRBox(local, hs, 2.0), max(x - head, tail - x));
  float band = solid(d);
  if (band <= 0.0) return vec4(0.0);
  float edge = smoothstep(10.0, 0.0, head - x) * (1.0 - smoothstep(0.4, 0.9, age));
  float s = world.x - world.y * 0.4 - mod(t * 240.0, 2400.0) + 400.0;
  float sheen = smoothstep(18.0, 0.0, abs(s)) * smoothstep(0.9, 1.4, age);
  vec3 face = mix(vec3(0.06, 0.48, 0.6), vec3(0.6, 0.86, 0.93), uLight);
  vec3 bright = mix(vec3(0.5, 0.9, 1.0), vec3(0.85, 0.97, 1.0), uLight);
  vec3 col = mix(face, bright, max(edge, sheen * 0.35));
  float a = mix(0.82, 0.8, uLight) * band * presence(fade);
  return vec4(col * a, a);
}`,
}
