import type { Preset } from 'hyperselect'

export const bark: Preset = {
  name: 'bark',
  pad: [16, 12, 18],
  tint: [0.5, 0.38, 0.28],
  selection: { dark: 'color:#fdf6ea;text-shadow:0 1px 2px rgb(0 0 0 / .9),0 0 6px rgb(0 0 0 / .45)', light: 'color:#24170c' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 4.0);
  float rough = fbm3(world * vec2(0.05, 0.12) + seed * 13.0);
  float d = sdRBox(local, hs, 5.0) + (rough - 0.5) * 9.0 + (noise(vec2(world.x * 0.3, world.y * 1.4)) - 0.5) * 1.6;
  float spread = age * 650.0 - abs(local.x + (hash(vec2(seed, 2.0)) - 0.5) * hs.x) + (rough - 0.5) * 60.0;
  float grown = smoothstep(0.0, 14.0, spread);
  float inside = smoothstep(0.7, -0.7, d) * grown;
  float sh = exp(-max(d - 1.0, 0.0) / 5.0) * (1.0 - inside) * grown * smoothstep(-6.0, 8.0, local.y) * mix(0.55, 0.15, uLight);
  vec2 warp = vec2(fbm3(world * 0.02 + seed * 4.0), fbm3(world * 0.02 + 9.0)) - 0.5;
  vec3 v = voronoi(vec2(world.x * 0.009, world.y * 0.13) + warp * vec2(0.4, 1.6) + seed * 7.0);
  float ridge = smoothstep(0.02, 0.45, v.y - v.x);
  float fiber = noise(vec2(world.x * 0.05, world.y * 0.9 + warp.x * 6.0) + seed);
  float h = ridge * (0.75 + 0.25 * fiber) + fbm(world * 0.15) * 0.15;
  vec3 nrm = normalize(vec3(-dFdx(h) * 4.0, -dFdy(h) * 4.0, 0.35));
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float lit = clamp(dot(nrm, normalize(vec3(-0.5, -0.7, 0.55))), 0.0, 1.0);
  vec3 plate = mix(vec3(0.27, 0.21, 0.16), vec3(0.68, 0.62, 0.55), uLight) * (0.85 + 0.3 * hash(vec2(v.z, 3.0)));
  vec3 weathered = mix(vec3(0.38, 0.36, 0.33), vec3(0.78, 0.75, 0.7), uLight);
  vec3 crevice = mix(vec3(0.04, 0.025, 0.02), vec3(0.42, 0.34, 0.27), uLight);
  vec3 col = mix(plate, weathered, smoothstep(0.55, 0.85, h) * smoothstep(0.4, 0.7, fiber) * 0.7);
  col = mix(crevice, col, smoothstep(0.05, 0.45, ridge));
  float algae = smoothstep(0.6, 0.85, fbm3(world * 0.035 + seed * 21.0)) * smoothstep(0.6, 0.2, ridge);
  col = mix(col, mix(vec3(0.16, 0.22, 0.08), vec3(0.58, 0.66, 0.42), uLight), algae * 0.5);
  col *= mix(0.55, 0.86, uLight) + mix(0.75, 0.26, uLight) * lit;
  col *= 0.9 + 0.2 * fiber;
  col *= 1.0 - mix(0.35, 0.2, uLight) * smoothstep(-3.0, 0.0, d);
  return vec4(col * inside, inside + sh * (1.0 - inside)) * fade;
}`,
}
