import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const plaster: Preset = {
  name: 'plaster',
  pad: [16, 10, 16],
  tint: [0.86, 0.72, 0.62],
  selection: { dark: 'color:#2a2018', light: 'color:#2a2018' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 3.0);
  float yy = local.y / hs.y;
  float front = local.x - (-hs.x - 40.0 + age * 1700.0) + yy * yy * 5.0 + local.y * 0.5;
  float smear = (fbm3(vec2(world.x * 0.03, sign(local.y) * 5.0 + seed * 9.0)) - 0.5) * 5.0;
  float box = sdRBox(local, hs, 3.0) + smear;
  float d = max(box, front);
  float inside = solid(d);
  float sh = drop(max(sdRBox(local - vec2(1.0, 3.0), hs, 3.0) + smear, front), 3.5) * (1.0 - inside) * mix(0.4, 0.13, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -box;
  float a = fbm3(world * 0.003 + seed * 2.0) * 3.0;
  vec2 dir = vec2(cos(a), sin(a));
  float stroke = noise(vec2(dot(world, dir) * 0.015, dot(world, vec2(-dir.y, dir.x)) * 0.12));
  float mottle = fbm(world * 0.018 + seed * 3.0);
  float burnish = smoothstep(0.55, 0.75, mottle);
  vec3 lime = mix(vec3(0.8, 0.73, 0.65), vec3(0.92, 0.87, 0.81), uLight);
  vec3 col = lime * (0.88 + 0.16 * mottle + 0.06 * (stroke - 0.5) + 0.03 * (noise(world * 1.2) - 0.5));
  col += vec3(0.05, 0.045, 0.04) * burnish * stroke;
  float ridge = exp(-abs(front + 3.0) / 2.5);
  col *= 1.0 + 0.12 * ridge * step(front, -3.0) - 0.15 * ridge * step(-3.0, front);
  col *= 1.0 + 0.12 * smoothstep(1.5, 0.0, abs(e - 1.4)) * step(local.y, 0.0);
  col *= 1.0 - 0.22 * smoothstep(1.5, 0.0, e) * step(0.0, local.y);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
