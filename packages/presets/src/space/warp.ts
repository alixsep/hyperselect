import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const warp: Preset = {
  name: 'warp',
  pad: [12, 8, 8],
  tint: [0.42, 0.62, 1],
  selection: {
    dark: 'color:#f2f6ff;text-shadow:0 0 4px rgb(4 8 24 / .9)',
    light: 'color:#f2f6ff;text-shadow:0 0 4px rgb(4 8 24 / .9)',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(0.0, 0.12, age);
  vec2 q = local / vec2(hs.x, hs.y * 1.6);
  float lane = atan(q.y, q.x) / (2.0 * PI) * 220.0;
  float aa = fwidth(lane);
  if (inside <= 0.0) return vec4(0.0);
  float r = length(q);
  float id = floor(lane);
  float across = abs(fract(lane) - 0.5) / max(aa, 1e-4);
  float h = hash(vec2(id, seed * 13.0));
  float jump = smoothstep(0.1, 1.3, age) * (0.4 + 0.6 * fade);
  float travel = t * (0.12 + 0.75 * jump) * (0.6 + 0.6 * h) + h * 7.0;
  float z = fract(travel);
  float head = 1.5 * z * z;
  float len = 0.004 + head * (0.05 + 0.5 * jump);
  float behind = head - r;
  float trail = smoothstep(-0.004, 0.002, behind) * smoothstep(len, 0.0, behind);
  float beam = smoothstep(1.0, 0.2, across) * step(0.55, hash(vec2(id, seed * 7.0 + 1.0))) * trail * smoothstep(0.0, 0.15, z);
  vec3 blue = vec3(0.42, 0.6, 1.0), white = vec3(0.92, 0.96, 1.0), violet = vec3(0.55, 0.42, 1.0);
  vec3 rgb = voidColor() + blue * exp(-r * 7.0) * 0.18 + violet * smoothstep(0.4, 1.4, r) * 0.04;
  rgb += mix(violet, mix(blue, white, smoothstep(0.4, 0.95, 1.0 - behind / len)), smoothstep(0.0, 0.4, z)) * beam * (0.25 + 0.6 * z) * (0.45 + 0.55 * smoothstep(2.0, 12.0, abs(local.y)));
  return sealed(rgb * inside, voidAlpha() * inside) * fade;
}`,
}
