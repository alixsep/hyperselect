import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const spotlight: Preset = {
  name: 'spotlight',
  pad: [16, 8, 10],
  tint: [0.72, 0.84, 1.0],
  selection: { dark: 'color:#ffffff', light: 'color:#0e1a2e' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float stage = smoothstep(1.5, -1.5, sdRBox(local, hs, 4.0));
  if (stage <= 0.0) return vec4(0.0);
  float open = easeOut(age * 1.8);
  float radius = min(hs.x, 60.0 + hs.y * 2.0) * mix(0.3, 1.0, open);
  float travel = max(hs.x - radius, 0.0) * sin(t * 0.35);
  float center = mix(-hs.x + radius, travel, open);
  float e = length(vec2((local.x - center) / radius, local.y / (hs.y * 3.0)));
  float aa = fwidth(e) * 1.5;
  float pool = smoothstep(1.0 + aa, 1.0 - aa, e) * (0.75 + 0.25 * (1.0 - e * e));
  float rim = smoothstep(0.7, 1.0, e) * pool;
  float k = max(pool, 0.12) * stage * open * presence(fade);
  vec3 beam = mix(vec3(0.88, 0.93, 1.0), vec3(0.62, 0.76, 1.0), uLight);
  beam = mix(beam, mix(vec3(0.62, 0.78, 1.0), vec3(0.48, 0.64, 1.0), uLight), rim * 0.5);
  return vec4(beam * k * mix(0.45, 0.55, uLight), k * mix(0.2, 0.5, uLight));
}`,
}
