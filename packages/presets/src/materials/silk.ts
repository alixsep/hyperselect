import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const silk: Preset = {
  name: 'silk',
  pad: [16, 10, 16],
  tint: [0.88, 0.64, 0.74],
  selection: { dark: 'color:#2a0f1f', light: 'color:#2a0f1f' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 3.0);
  float head = -hs.x - 30.0 + age * 1800.0;
  float ripple = sin(local.y * 0.2 + t * 3.0) * 3.5;
  float hem = sin(world.x * 0.045 + t * 0.6 + seed * 6.0);
  float box = sdRBox(local + vec2(0.0, hem), hs, 4.0);
  float d = max(box, local.x - head + ripple);
  float inside = smoothstep(0.7, -0.7, d);
  float sh = drop(max(sdRBox(local - vec2(1.0, 4.0), hs, 4.0), local.x - head), 6.0) * (1.0 - inside) * mix(0.4, 0.12, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -box;
  float w = fbm(vec2(world.x * 0.004, world.y * 0.02) + vec2(t * 0.03, seed * 5.0));
  float phase = world.x * 0.022 + local.y * 0.05 + w * 6.0 - t * 0.35;
  float fold = sin(phase);
  float sheen = smoothstep(0.2, 1.0, fold);
  sheen *= sheen;
  float crease = smoothstep(-0.5, -1.0, fold);
  float weave = noise(world * vec2(1.6, 0.2));
  vec3 rose = mix(vec3(0.74, 0.5, 0.6), vec3(0.9, 0.76, 0.82), uLight);
  vec3 lilac = mix(vec3(0.62, 0.52, 0.74), vec3(0.82, 0.77, 0.9), uLight);
  vec3 col = mix(rose, lilac, 0.5 + 0.5 * sin(phase * 0.5 + 1.3));
  col *= 0.94 + 0.04 * weave;
  col = mix(col, vec3(1.0, 0.95, 0.97), sheen * mix(0.6, 0.45, uLight));
  col *= 1.0 - crease * mix(0.38, 0.22, uLight);
  col += vec3(0.25, 0.18, 0.22) * exp(-abs(local.x - head + ripple) / 8.0) * step(head, hs.x + 20.0);
  col *= 1.0 - 0.3 * smoothstep(1.2, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
