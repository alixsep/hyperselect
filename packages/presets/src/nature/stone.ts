import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const stone: Preset = {
  name: 'stone',
  pad: [16, 12, 18],
  tint: [0.5, 0.56, 0.62],
  selection: { dark: 'color:#f4f6f8;text-shadow:0 1px 2px rgb(0 0 0 / .75)', light: 'color:#1b2026' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 4.0);
  float settle = easeOut(age * 3.0);
  vec2 p = local / (1.0 + 0.05 * (1.0 - settle));
  vec3 shard = voronoi(world * 0.05 + seed * 17.0);
  float chip = step(0.45, shard.z) * (1.0 + 2.5 * hash(vec2(shard.z, 2.0)));
  float d = sdRBox(p, hs, 3.0) + chip + (noise(world * 0.6) - 0.5) * 0.5;
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float lift = 3.0 + 6.0 * (1.0 - settle);
  float sh = exp(-max(sdRBox(p - vec2(1.5, lift), hs, 4.0) + chip, 0.0) / (4.0 + lift)) * (1.0 - inside) * mix(0.6, 0.18, uLight);
  float strata = local.y * 0.07 + fbm(world * vec2(0.006, 0.02) + seed * 5.0) * 2.5;
  float terrace = fract(strata);
  float h = fbm(world * 0.035 + seed * 3.0) * 0.7 + smoothstep(0.0, 0.2, terrace) * 0.12 + noise(world * 0.5) * 0.02;
  vec3 nrm = normalize(vec3(-dFdx(h) * 2.5, -dFdy(h) * 2.5, 0.3));
  float lit = clamp(dot(nrm, normalize(vec3(-0.5, -0.6, 0.6))), 0.0, 1.0);
  if (inside <= 0.0) return vec4(vec3(0.0) * sh, sh) * fade * settle;
  float layer = hash(vec2(floor(strata), seed));
  vec3 slate = mix(vec3(0.24, 0.27, 0.3), vec3(0.72, 0.75, 0.77), uLight);
  vec3 col = slate * (0.9 + 0.14 * layer) * (0.9 + 0.2 * fbm3(world * 0.12 + 4.0));
  float stain = smoothstep(0.55, 0.8, fbm3(world * 0.02 + seed * 11.0));
  col = mix(col, col * mix(vec3(1.35, 1.05, 0.75), vec3(1.08, 1.0, 0.9), uLight), stain * 0.6);
  float vein = smoothstep(0.02, 0.0, abs(fbm3(world * vec2(0.03, 0.06) + seed * 2.0) - 0.5)) * step(0.5, hash(vec2(seed, 4.0)));
  col = mix(col, mix(vec3(0.62, 0.64, 0.64), vec3(0.95, 0.95, 0.94), uLight), vein * 0.3);
  float pit = smoothstep(0.9, 0.97, noise(world * 0.5 + 3.0));
  col *= 1.0 - 0.25 * pit;
  col *= mix(0.65, 0.88, uLight) + mix(0.6, 0.2, uLight) * lit;
  col *= 1.0 - mix(0.18, 0.08, uLight) * smoothstep(0.0, 0.05, terrace) * smoothstep(0.12, 0.05, terrace);
  float edge = -d;
  vec2 outward = normalize(p - clamp(p, -hs + 3.0, hs - 3.0) + vec2(1e-4, 0.0));
  float bevel = smoothstep(3.5, 0.0, edge);
  col *= 1.0 + bevel * dot(outward, normalize(vec2(-0.6, -0.8))) * 0.35;
  col *= 1.0 - 0.35 * smoothstep(1.0, 0.0, edge) * (1.0 - uLight);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh * (1.0 - inside));
  return c * fade * settle;
}`,
}
