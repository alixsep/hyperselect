import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const chrome: Preset = {
  name: 'chrome',
  pad: [14, 10, 16],
  tint: [0.68, 0.78, 0.92],
  selection: { dark: 'color:#0a0e15', light: 'color:#0a0e15' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = min(hs.y, 6.0);
  float head = -hs.x - 30.0 + age * 1600.0;
  float box = sdRBox(local, hs, r);
  float d = max(box, local.x - head);
  float inside = solid(d);
  float sh = drop(max(sdRBox(local - vec2(1.5, 4.0), hs, r), local.x - head), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -box;
  vec2 n = outward(local, hs, r);
  float bevel = smoothstep(3.5, 0.0, e);
  float v = local.y / hs.y * 0.55 + n.y * bevel * 0.9;
  float horizon = 0.3 + 0.03 * sin(local.x * 0.011 + seed * 6.0);
  float aa = fwidth(v) * 0.8 + 0.004;
  vec3 sky = mix(mix(vec3(0.5, 0.6, 0.74), vec3(0.66, 0.74, 0.84), uLight), mix(vec3(0.97, 0.98, 1.0), vec3(1.0), uLight), smoothstep(-1.3, horizon, v));
  vec3 ground = mix(mix(vec3(0.2, 0.2, 0.22), vec3(0.4, 0.41, 0.44), uLight), mix(vec3(0.62, 0.62, 0.64), vec3(0.74, 0.75, 0.77), uLight), smoothstep(horizon, 1.3, v));
  float below = smoothstep(horizon - aa, horizon + aa, v);
  vec3 col = mix(sky, ground, below);
  float u = local.x + local.y * 0.18 + n.x * bevel * 30.0 - t * 5.0;
  float cell = 300.0;
  float k = floor(u / cell + seed);
  float s = abs(fract(u / cell + seed) - 0.5) * cell;
  float w = 10.0 + 14.0 * hash(vec2(k, 3.0));
  float ua = fwidth(u) * 0.8;
  float strip = smoothstep(w + ua, w - ua, s) * 0.85 + 0.7 * smoothstep(1.2 + ua, 1.2 - ua, abs(s - w - 7.0));
  col = mix(col, vec3(1.0), strip * mix(0.75, 0.3, below));
  float glint = exp(-abs(local.x + local.y * 0.5 - head + 34.0) / 9.0) * (1.0 - smoothstep(0.0, 0.2, age - (2.0 * hs.x + 60.0) / 1600.0));
  col += vec3(0.9, 0.95, 1.0) * glint * 0.8;
  col *= 1.0 + 0.25 * smoothstep(1.4, 0.0, abs(e - 1.6)) * step(local.y, 0.0);
  col *= 1.0 - 0.55 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
