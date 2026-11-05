import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const abyss: Preset = {
  name: 'abyss',
  pad: [16, 12, 14],
  tint: [0.24, 0.34, 0.6],
  selection: { dark: 'color:#c9d4e8', light: 'color:#dfe6f2' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float open = easeOut(age * 2.2) * smoothstep(0.0, 0.7, fade);
  vec2 hs = vec2(halfSize.x + 6.0, halfSize.y * open);
  float d = window(hs, min(6.0, hs.y), cover * open);
  float inside = solid(d);
  float shade = exp(-max(d, 0.0) / 7.0) * (1.0 - inside) * mix(0.5, 0.22, uLight) * open;
  if (inside + shade <= 0.0) return vec4(0.0);
  float side = hs.x - abs(local.x);
  float depth = mix(smoothstep(0.0, 16.0, local.y + hs.y), 1.0, cover) * smoothstep(0.0, 10.0, side);
  vec3 black = mix(vec3(0.0, 0.0, 0.004), vec3(0.008, 0.01, 0.02), uLight);
  vec3 lip = mix(vec3(0.07, 0.09, 0.15), vec3(0.16, 0.19, 0.28), uLight);
  vec3 rgb = mix(lip, black, depth);
  float far = 0.0;
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    vec4 m = starCell(world + vec2(t * (1.0 - 2.0 * fk), -t * (3.0 + 4.0 * fk)), 11.0 + 7.0 * fk, seed + fk);
    far += step(0.62, m.z) * point(m.xy, 0.2 + 0.35 * fk) * (0.55 + 0.45 * sin(t * 0.7 + m.w * 30.0)) * (0.35 + 0.25 * fk);
  }
  rgb += vec3(0.35, 0.5, 0.8) * far * depth * smoothstep(0.4, 1.4, age);
  float rim = smoothstep(1.4, 0.0, abs(d + 0.7)) * smoothstep(-hs.y * 0.3, -hs.y, local.y) * (1.0 - cover);
  rgb += mix(vec3(0.3, 0.4, 0.6), vec3(0.62, 0.68, 0.8), uLight) * rim * 0.5;
  vec4 c = vec4(rgb * inside, inside) + vec4(0.0, 0.0, 0.0, shade) * (1.0 - inside);
  return c * fade;
}`,
}
