import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const dew: Preset = {
  name: 'dew',
  pad: [12, 10, 12],
  tint: [0.6, 0.82, 0.84],
  selection: { dark: 'color:#f4fffd;text-shadow:0 1px 2px rgb(0 20 20 / .85)', light: 'color:#0d2a26' },
  surface: /* glsl */ `${growth}
vec4 droplet(vec4 below, vec2 q, float r) {
  if (r < 0.4) return below;
  float d = length(q * vec2(1.0, 1.1)) - r;
  vec2 sq = q - vec2(1.2, 1.8);
  float shade = smoothstep(2.0, -r * 0.3, length(sq * vec2(1.0, 1.1)) - r) * mix(0.32, 0.14, uLight);
  below.rgb *= 1.0 - shade;
  below.a = below.a + shade * (1.0 - below.a);
  float inside = smoothstep(0.6, -0.6, d);
  if (inside <= 0.0) return below;
  vec2 u = q / r;
  float radial = length(u);
  vec2 sun = normalize(vec2(-0.6, -0.8));
  float facing = dot(u, sun);
  float lens = smoothstep(0.35, 1.0, radial);
  vec3 glass = mix(vec3(0.42, 0.62, 0.6), vec3(0.86, 0.96, 0.95), uLight);
  vec3 edge = mix(vec3(0.02, 0.06, 0.07), vec3(0.3, 0.46, 0.46), uLight);
  vec4 col = over(below, glass * (0.7 + 0.5 * smoothstep(0.3, -0.8, facing)), inside * mix(0.42, 0.5, uLight));
  col = over(col, edge, inside * lens * (0.45 + 0.4 * smoothstep(-0.2, 0.8, facing)) * mix(0.8, 0.7, uLight));
  float caustic = smoothstep(0.3, 0.0, abs(radial - 0.62)) * smoothstep(0.1, -0.7, facing);
  col = over(col, mix(vec3(0.8, 1.0, 0.96), vec3(1.0), uLight), inside * caustic * mix(0.5, 0.6, uLight));
  float spark = smoothstep(0.34, 0.12, length(u - sun * 0.48)) + 0.6 * smoothstep(0.14, 0.04, length(u + sun * 0.42));
  col = over(col, vec3(1.0), inside * min(spark, 1.0) * 0.95);
  return col;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float band = sdRBox(local, hs, 9.0) + (fbm3(world * 0.04 + seed * 5.0) - 0.5) * 6.0;
  if (band > 10.0) return vec4(0.0);
  float film = smoothstep(0.6, -0.6, band) * smoothstep(0.0, 0.5, age);
  float wax = fbm3(world * vec2(0.012, 0.03) + seed);
  float sheen = exp(-pow((world.x * 0.7 + world.y * 0.4) * 0.004 - t * 0.05 - floor((world.x * 0.7 + world.y * 0.4) * 0.004 - t * 0.05) - 0.5, 2.0) * 40.0);
  vec3 leaf = mix(vec3(0.09, 0.17, 0.15), vec3(0.8, 0.9, 0.87), uLight) * (0.85 + 0.3 * wax);
  leaf += mix(vec3(0.05, 0.08, 0.08), vec3(0.06, 0.06, 0.06), uLight) * sheen;
  vec4 col = vec4(leaf, 1.0) * film * mix(0.62, 0.55, uLight);
  float x = local.x + hs.x;
  float spread = (age - x / 1100.0) / 1.6;
  float dry = 0.35 + 0.65 * fade;
  vec2 fine = floor(world / 7.0);
  vec2 fc = (fine + 0.3 + 0.4 * hash2(fine + seed * 3.0)) * 7.0;
  float fh = hash(fine + seed * 9.0);
  float fr = (0.7 + 0.9 * hash(fine + 2.0)) * easeOut(spread * 1.6 - fh * 0.5) * dry * step(0.45, fh) * film;
  col = droplet(col, world - fc, fr);
  vec2 mid = floor(world / 16.0);
  vec2 mc = (mid + 0.5 + (hash2(mid + seed * 7.0) - 0.5) * 0.4) * 16.0;
  float mh = hash(mid + seed * 4.0);
  float mr = (2.0 + 2.6 * hash(mid + 6.0)) * easeOut(spread - mh * 0.6) * dry * step(0.25, mh) * step(sdRBox(mc - (world - local), hs, 9.0), -3.0);
  col = droplet(col, world - mc, mr);
  vec2 big = floor(world / 38.0);
  vec2 bc = (big + 0.5 + (hash2(big + seed * 2.0) - 0.5) * 0.5) * 38.0;
  float bh = hash(big + seed * 6.0);
  float br = (5.0 + 3.5 * hash(big + 1.0)) * easeOut((spread - 0.4 - bh * 0.6) * 0.8) * dry * step(0.4, bh) * step(sdRBox(bc - (world - local), hs, 9.0), -5.0);
  col = droplet(col, world - bc, br);
  return col * fade;
}`,
}
