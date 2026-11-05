import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const gouache: Preset = {
  name: 'gouache',
  pad: [22, 12, 12],
  tint: [0.95, 0.66, 0.5],
  selection: { dark: 'color:#f6fbfc', light: 'color:#2a160c' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 14.0 || abs(local.y) > hs.y + 6.0) return vec4(0.0);
  float bands = max(1.0, floor(hs.y * 2.0 / 11.0));
  float h = hs.y * 2.0 / bands;
  float i = floor((local.y + hs.y) / h);
  vec4 c = vec4(0.0);
  for (int k = -1; k <= 1; k++) {
    float j = i + float(k);
    if (j < 0.0 || j > bands - 1.0) continue;
    float v = local.y + hs.y - (j + 0.5) * h;
    float start = -hs.x - 4.0 + hash(vec2(j, seed)) * 8.0;
    float end = hs.x + 4.0 - hash(vec2(j, seed + 2.0)) * 8.0;
    float thick = h * 0.5 + 2.5 + (noise(vec2(world.x * 0.03, j + seed)) - 0.5) * 2.0;
    float x = (local.x - start) / (end - start);
    float d = max(abs(v) - thick, max(start - local.x, local.x - end));
    float bristle = noise(vec2(v * 0.9 + j * 13.0, world.x * 0.01));
    float dry = smoothstep(0.85, 1.0, x) * 0.7 + smoothstep(0.08, 0.0, x) * 0.5;
    float paint = solid(d) * smoothstep(dry - 0.05, dry + 0.05, bristle) * sweep(local.x, hs, age - j * 0.12, 1100.0, 10.0);
    vec3 color = mod(j, 2.0) < 0.5 ? sky(vec3(0.13, 0.3, 0.36), vec3(0.99, 0.82, 0.66)) : sky(vec3(0.17, 0.27, 0.4), vec3(0.98, 0.77, 0.67));
    color *= 1.0 + (noise(vec2(world.x * 0.02, v * 1.2 + j)) - 0.5) * 0.08;
    color = mix(color, color * sky(vec3(1.25), vec3(0.88)), stroke(d + 0.8, 0.8));
    c = over(c, color, paint * 0.96);
  }
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
