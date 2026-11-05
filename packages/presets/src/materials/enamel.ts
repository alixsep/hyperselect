import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const enamel: Preset = {
  name: 'enamel',
  pad: [14, 10, 16],
  tint: [0.86, 0.22, 0.24],
  selection: { dark: 'color:#fff5f2;text-shadow:0 1px 2px rgb(60 0 0 / .6)', light: 'color:#3a0707' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 4.0);
  float r = min(hs.y, 8.0);
  float d = sdRBox(local, hs, r);
  float inside = solid(d);
  float ring = easeOut(age * 6.0);
  float sh = drop(sdRBox(local - vec2(1.5, 4.0), hs, r), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight) * ring;
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -d;
  vec2 n = outward(local, hs, r);
  float rimW = 2.4;
  float bezel = smoothstep(rimW - 0.6, rimW + 0.6, e);
  float yy = local.y / hs.y;
  float front = local.x - (-hs.x + (age - 0.06) * 1900.0) + yy * yy * 8.0;
  float filled = smoothstep(0.8, -0.8, front);
  float meniscus = exp(-abs(front + 2.0) / 3.0) * filled;
  float goldTone = clamp(0.55 - n.y * 0.35 - n.x * 0.1 + 0.25 * smoothstep(1.0, 0.0, abs(e - 1.2)), 0.0, 1.0);
  vec3 bezelCol = mix(vec3(0.5, 0.34, 0.1), vec3(1.0, 0.88, 0.55), goldTone);
  vec3 well = mix(vec3(0.32, 0.22, 0.12), vec3(0.72, 0.62, 0.48), uLight);
  vec3 red = mix(vec3(0.66, 0.06, 0.09), vec3(0.93, 0.5, 0.48), uLight);
  vec3 glaze = red * (0.72 + 0.28 * smoothstep(0.0, 8.0, e - rimW)) * (0.9 + 0.15 * smoothstep(hs.y, -hs.y, local.y));
  vec2 hl = vec2(hs.x - r - 2.0, hs.y * 0.14);
  float shine = solid(sdRBox(local - vec2(0.0, -hs.y * 0.6), hl, hl.y)) * smoothstep(hs.x, -hs.x, local.x) * filled;
  glaze = mix(glaze, vec3(1.0), shine * mix(0.32, 0.4, uLight));
  glaze += vec3(0.25, 0.1, 0.1) * meniscus;
  float bubble = step(0.996, hash(floor(world * 0.5) + seed)) * 0.35;
  glaze = mix(glaze, glaze * 1.35, bubble);
  vec3 col = mix(bezelCol, mix(well, glaze, filled), bezel);
  col *= 1.0 - 0.35 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) * ring + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
