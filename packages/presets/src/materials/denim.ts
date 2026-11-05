import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const denim: Preset = {
  name: 'denim',
  pad: [18, 10, 16],
  tint: [0.27, 0.42, 0.68],
  selection: { dark: 'color:#f3f6ff', light: 'color:#0b1830' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 4.0);
  float r = 2.5;
  float show = easeOut(age * 4.0);
  float d = sdRBox(local, hs, r);
  float inside = solid(d);
  float side = abs(local.x) - hs.x;
  float row = floor(world.y * 0.5);
  float strand = smoothstep(0.0, 0.5, fract(world.y * 0.5)) * smoothstep(1.0, 0.5, fract(world.y * 0.5));
  float reach = 6.0 * hash(vec2(row, seed + sign(local.x)));
  float thread = strand * step(0.0, side) * smoothstep(reach, reach - 1.5, side) * step(abs(local.y), hs.y - 2.0) * step(0.45, hash(vec2(row, seed * 3.0)));
  float sh = drop(sdRBox(local - vec2(1.0, 3.5), hs, r), 4.0) * (1.0 - inside) * mix(0.5, 0.15, uLight);
  vec3 weft = mix(vec3(0.66, 0.72, 0.84), vec3(0.88, 0.91, 0.96), uLight);
  if (inside <= 0.0) return vec4(weft * thread * 0.8, max(thread * 0.8, sh)) * fade * show;
  float e = -d;
  float twill = sin((world.x - world.y * 0.62) * 1.8);
  float slub = noise(vec2(world.x * 0.9, world.y * 0.05 + seed * 9.0));
  float wear = fbm(world * vec2(0.008, 0.035) + seed * 4.0);
  vec3 indigo = mix(vec3(0.09, 0.15, 0.31), vec3(0.4, 0.52, 0.7), uLight);
  vec3 col = mix(indigo, weft, 0.12 + 0.07 * twill + 0.12 * (slub - 0.5) + 0.4 * smoothstep(0.45, 0.8, wear));
  col *= 1.0 - 0.3 * smoothstep(5.0, 0.0, e);
  float sew = -hs.x + 4.0 + (age - 0.18) * 650.0;
  float rowY = hs.y - 3.8;
  float sy = abs(abs(local.y) - rowY);
  float dash = smoothstep(0.0, 0.12, fract(world.x / 6.0)) * smoothstep(0.72, 0.6, fract(world.x / 6.0));
  float span = step(abs(local.x), hs.x - 3.5) * smoothstep(0.0, -3.0, local.x - sew);
  float stitch = smoothstep(1.5, 0.7, sy) * dash * span;
  float under = smoothstep(1.2, 0.3, abs(abs(local.y) - rowY - 1.2)) * dash * span;
  col *= 1.0 - 0.35 * under;
  col = mix(col, mix(vec3(0.93, 0.6, 0.2), vec3(0.9, 0.56, 0.16), uLight), stitch);
  col *= 1.0 + 0.15 * smoothstep(1.2, 0.0, abs(e - 1.0)) * step(local.y, 0.0);
  vec4 c = vec4(col * inside, inside) + vec4(weft * thread * 0.8, max(thread * 0.8, sh)) * (1.0 - inside);
  return c * fade * show;
}`,
}
