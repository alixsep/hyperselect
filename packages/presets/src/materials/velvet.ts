import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const velvet: Preset = {
  name: 'velvet',
  pad: [14, 10, 16],
  tint: [0.5, 0.16, 0.42],
  selection: { dark: 'color:#fff0f9', light: 'color:#23061b' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = min(hs.y, 7.0);
  float fuzz = (noise(world * 0.9) - 0.5) * 1.1;
  float d = sdRBox(local, hs, r) + fuzz;
  float bloom = length(local / (hs + 20.0)) - age * 3.6;
  float shown = smoothstep(0.0, -0.25, bloom);
  float inside = smoothstep(0.9, -0.9, d) * shown;
  float sh = drop(sdRBox(local - vec2(1.0, 4.0), hs, r), 6.0) * (1.0 - inside) * shown * mix(0.5, 0.15, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -d;
  float nap = fbm(world * vec2(0.012, 0.02) + vec2(t * 0.02, seed * 7.0));
  float crush = fbm3(world * vec2(0.016, 0.03) + seed * 3.0 + nap * 1.5);
  float pile = noise(world * 1.4);
  float grazing = smoothstep(9.0, 0.8, e);
  float front = exp(-abs(bloom) * 9.0) * (1.0 - smoothstep(1.0, 1.4, age * 3.6));
  float sheen = 0.4 * grazing * grazing + 0.45 * smoothstep(0.35, 0.8, crush) * (0.6 + 0.4 * nap) + 0.06 * (pile - 0.5) + 0.1 * smoothstep(hs.y, -hs.y, local.y) + 0.15 * front;
  vec3 deep = mix(vec3(0.2, 0.035, 0.15), vec3(0.64, 0.4, 0.58), uLight);
  vec3 lit = mix(vec3(0.72, 0.34, 0.6), vec3(0.92, 0.78, 0.88), uLight);
  vec3 col = mix(deep, lit, clamp(sheen, 0.0, 1.0));
  col *= 1.0 - 0.15 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
