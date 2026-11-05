import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const mars: Preset = {
  name: 'mars',
  pad: [12, 8, 10],
  tint: [0.82, 0.36, 0.2],
  selection: { dark: 'color:#fff1e6', light: 'color:#3a1206' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 5.0, cover);
  vec2 p = world * vec2(0.016, 0.028) + seed * 5.0;
  float storm = fbm3(world * 0.012 + vec2(-t * 0.12, seed));
  float front = -hs.x - 40.0 + age * 1700.0 - (storm - 0.5) * 60.0;
  float inside = solid(max(d, local.x - front));
  if (inside <= 0.0) return vec4(0.0);
  float h = fbm(p);
  float slope = (fbm(p + vec2(0.05, 0.03)) - h) * 14.0;
  float ripple = sin(dot(world, vec2(0.85, 0.5)) * 0.42 + h * 16.0);
  ripple = smoothstep(0.2, 1.0, ripple) * smoothstep(0.35, 0.6, h);
  float rock = smoothstep(0.62, 0.7, h);
  vec3 low = mix(vec3(0.32, 0.1, 0.05), vec3(0.84, 0.56, 0.43), uLight);
  vec3 high = mix(vec3(0.6, 0.27, 0.12), vec3(0.95, 0.75, 0.6), uLight);
  vec3 haze = mix(vec3(0.72, 0.42, 0.26), vec3(0.99, 0.88, 0.78), uLight);
  vec3 col = mix(low, high, smoothstep(0.3, 0.7, h));
  col *= 0.88 + clamp(slope, -0.4, 0.4) * mix(1.0, 0.4, uLight) + ripple * 0.06;
  col = mix(col, low * mix(0.7, 0.9, uLight), rock * 0.4);
  float dust = (0.18 + 0.55 * exp(-age * 1.6)) * smoothstep(0.35, 0.75, storm);
  col = mix(col, haze, dust);
  float bevel = smoothstep(2.5, 0.0, -d);
  col *= 1.0 - 0.2 * bevel;
  return vec4(col * inside, inside) * fade;
}`,
}
