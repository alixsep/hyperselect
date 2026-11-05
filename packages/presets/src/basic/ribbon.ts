import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const ribbon: Preset = {
  name: 'ribbon',
  pad: [28, 6, 14],
  tint: [0.86, 0.16, 0.26],
  selection: { dark: 'color:#fff0f2', light: 'color:#3a0510' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float span = 2.0 * hs.x + 24.0;
  float x = local.x + hs.x + 12.0;
  float head = easeOut(age * 1.6) * span;
  float tail = leaving(age, fade) * span;
  float shown = smoothstep(head + 1.0, head - 1.0, x) * smoothstep(tail - 1.0, tail + 1.0, x);
  if (shown <= 0.0) return vec4(0.0);
  float band = solid(sdBox(local, hs));
  vec2 q = vec2(abs(local.x), local.y - 4.0);
  float notch = 6.0 * (1.0 - abs(q.y) / hs.y);
  float end = solid(max(abs(q.y) - hs.y, max(hs.x - 10.0 - q.x, q.x - hs.x - 10.0 + notch)));
  vec3 red = mix(vec3(0.66, 0.08, 0.16), vec3(0.95, 0.56, 0.6), uLight);
  float y = local.y / hs.y;
  float satin = 0.86 + 0.16 * smoothstep(0.9, -0.5, y) - 0.08 * y * y;
  float sheen = exp(-abs(y + 0.45) * 5.0) * 0.12;
  float glide = smoothstep(70.0, 0.0, abs(local.x - mod(t * 90.0 + seed * 400.0, 2.0 * hs.x + 400.0) + hs.x + 200.0)) * 0.08;
  vec3 face = red * satin + (sheen + glide) * (1.0 - 0.5 * uLight);
  float fold = mix(0.42, 0.66, smoothstep(hs.x - 1.0, hs.x + 1.0, q.x));
  vec4 c = vec4(red * fold, 1.0) * end;
  c = over(c, face, band);
  return c * shown * presence(fade);
}`,
}
