import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const rust: Preset = {
  name: 'rust',
  pad: [14, 10, 16],
  tint: [0.76, 0.36, 0.15],
  selection: { dark: 'color:#fff3e8;text-shadow:0 1px 2px rgb(30 8 0 / .7)', light: 'color:#1f0e04' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float show = easeOut(age * 5.0);
  float box = sdRBox(local, hs, 1.5);
  float sh = drop(sdRBox(local - vec2(1.5, 3.5), hs, 1.5), 4.0) * mix(0.5, 0.16, uLight);
  if (box > 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * show;
  float corr = fbm(world * 0.025 + seed * 3.0);
  float grow = easeOut(age * 0.8);
  float level = corr - 1.25 + grow * 0.97 + smoothstep(8.0, 0.0, -box) * 0.12;
  float rusted = smoothstep(0.0, 0.05, level);
  float eaten = max(noise(world * 0.3 + seed) - 0.62, 0.0) * 14.0 * smoothstep(0.1, 0.3, level);
  float d = box + eaten;
  float inside = solid(d);
  float e = -d;
  float grit = noise(world * 1.2);
  float bloom = fbm3(world * 0.09 + seed * 7.0);
  float pit = smoothstep(0.78, 0.9, noise(world * 0.45 + 5.0));
  vec3 steel = mix(vec3(0.33, 0.35, 0.38), vec3(0.6, 0.62, 0.64), uLight) * (0.9 + 0.2 * noise(vec2(world.x * 0.02, world.y * 0.4)));
  vec3 orange = mix(vec3(0.7, 0.31, 0.1), vec3(0.86, 0.55, 0.35), uLight);
  vec3 brown = mix(vec3(0.25, 0.1, 0.045), vec3(0.6, 0.36, 0.22), uLight);
  vec3 oxide = mix(brown, orange, smoothstep(0.3, 0.72, bloom + 0.25 * (grit - 0.5)));
  oxide = mix(oxide, orange * 1.12, smoothstep(0.8, 0.95, grit) * 0.5);
  oxide *= 1.0 - 0.45 * pit;
  vec3 col = mix(steel, oxide, rusted);
  col = mix(col, brown * 0.8, smoothstep(0.06, 0.0, abs(level - 0.03)) * 0.6 * (1.0 - grow * 0.5));
  col *= 1.0 - 0.35 * smoothstep(1.2, 0.0, e);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh * (1.0 - inside));
  return c * fade * show;
}`,
}
