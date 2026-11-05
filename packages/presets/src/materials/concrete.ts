import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const concrete: Preset = {
  name: 'concrete',
  pad: [14, 10, 16],
  tint: [0.6, 0.6, 0.58],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(0 0 0 / .6)', light: 'color:#151719' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float pour = easeOut(age * 5.0);
  float chip = max(fbm3(world * 0.15 + seed * 5.0) - 0.55, 0.0) * 6.0;
  float d = sdRBox(local, hs, 1.0) + chip;
  float inside = solid(d);
  float sh = drop(sdRBox(local - vec2(1.5, 3.5), hs, 1.0) + chip, 4.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade * pour;
  float e = -d;
  float blot = fbm(world * 0.02 + seed * 7.0);
  float sand = noise(world * 0.9);
  vec3 v = voronoi(world * 0.085 + seed * 3.0);
  float holeR = 0.08 + 0.1 * hash(vec2(v.z, 4.0));
  float hd = (v.x - holeR) / 0.085;
  float isHole = step(0.84, hash(vec2(v.z, 9.0)));
  float hole = smoothstep(0.6, -0.6, hd) * isHole;
  float holeRim = smoothstep(1.2, 0.0, abs(hd + 0.4)) * isHole;
  float speck = step(0.94, hash(floor(world * 0.7) + seed));
  float dry = smoothstep(0.0, 0.25, age * 0.7 - 0.2 - (blot - 0.5) * 1.4);
  vec3 gray = mix(vec3(0.43, 0.43, 0.42), vec3(0.73, 0.73, 0.71), uLight);
  vec3 col = gray * (0.84 + 0.3 * blot) * (0.93 + 0.14 * sand);
  col *= 1.0 + 0.18 * speck * (hash(floor(world * 0.7) + 2.0) - 0.4);
  col = mix(col, col * mix(0.45, 0.68, uLight), hole);
  col *= 1.0 + 0.2 * holeRim * (1.0 - hole);
  col *= mix(mix(0.62, 0.8, uLight), 1.0, dry);
  col += vec3(0.04) * (1.0 - dry) * smoothstep(0.6, 0.8, sand);
  col *= 1.0 + 0.18 * smoothstep(1.2, 0.0, abs(e - 1.0)) * step(local.y, 0.0);
  col *= 1.0 - 0.3 * smoothstep(1.0, 0.0, e) * step(0.0, local.y);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade * pour;
}`,
}
