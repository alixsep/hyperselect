import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const lunar: Preset = {
  name: 'lunar',
  pad: [10, 6, 10],
  tint: [0.72, 0.75, 0.82],
  selection: { dark: 'color:#0f1115', light: 'color:#15171c' },
  surface: /* glsl */ `${cosmos}
float crater(vec2 p, float cell, float seed, vec2 sun) {
  vec2 id = floor(p / cell);
  float h = hash(id + seed);
  vec2 c = (id + 0.5 + (hash2(id + seed * 3.0) - 0.5) * 0.3) * cell;
  float r = cell * (0.14 + 0.22 * hash(id + seed * 5.0));
  vec2 q = (p - c) / r;
  float l = length(q);
  float bowl = smoothstep(1.0, 0.82, l);
  float rim = smoothstep(1.45, 1.0, l) * smoothstep(0.75, 1.0, l);
  float facing = dot(q, sun);
  return step(0.35, h) * (-bowl * (facing * 0.55 + 0.1) + rim * facing * 0.35 * -1.0 + rim * 0.06);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 4.0, cover);
  float inside = solid(d);
  float shadow = exp(-max(sdRBox(local - vec2(2.0, 4.0), hs, 4.0), 0.0) / 5.0) * (1.0 - inside) * mix(0.5, 0.18, uLight);
  if (inside + shadow <= 0.0) return vec4(0.0);
  vec2 sun = normalize(vec2(-1.0, -0.45));
  float maria = smoothstep(0.42, 0.62, fbm(world * 0.009 + seed * 4.0));
  float grit = noise(world * 0.9) * 0.5 + noise(world * 0.31) * 0.5;
  float relief = crater(world, 34.0, seed, sun) + crater(world + 13.0, 13.0, seed + 1.0, sun) * 0.8;
  float tone = mix(0.66, 0.54, maria) * (0.93 + 0.1 * grit) + relief * 0.22;
  vec3 dust = mix(vec3(0.58, 0.59, 0.62), vec3(0.86, 0.87, 0.88), uLight);
  vec3 col = dust * tone / 0.6;
  float terminator = -hs.x - 50.0 + age * 1500.0;
  float day = smoothstep(terminator + 20.0, terminator - 30.0, local.x) * mix(1.0, smoothstep(0.0, 0.8, fade), 1.0);
  col = mix(col * vec3(0.32, 0.34, 0.4), col, day);
  float bevel = smoothstep(3.0, 0.0, -d);
  col *= 1.0 + bevel * 0.12 * step(local.y, 0.0) * (1.0 - cover);
  vec4 c = vec4(0.0, 0.0, 0.0, shadow);
  c = over(c, col, inside);
  return c * fade;
}`,
}
