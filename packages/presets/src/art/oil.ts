import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const oil: Preset = {
  name: 'oil',
  pad: [20, 14, 14],
  tint: [0.35, 0.48, 0.85],
  selection: { dark: 'color:#f6f8ff;text-shadow:0 1px 2px rgb(0 0 20 / .6)', light: 'color:#221a06' },
  surface: /* glsl */ `${studio}
vec3 dab(vec2 p, float seed) {
  float row = floor(p.y / 7.0);
  float shift = hash(vec2(row, seed)) * 30.0;
  vec2 id = vec2(floor((p.x + shift) / 24.0), row);
  vec2 q = rotate(vec2(mod(p.x + shift, 24.0) - 12.0, mod(p.y, 7.0) - 3.5), (hash(id + seed) - 0.5) * 0.5);
  float ridge = 0.55 + 0.45 * noise(vec2(q.y * 1.6 + hash(id) * 30.0, q.x * 0.06));
  float h = ridge * smoothstep(5.5, 2.0, abs(q.y)) * smoothstep(13.0, 8.0, abs(q.x));
  return vec3(h, hash(id + seed + 5.0), hash(id + 9.0));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdBox(local, hs);
  if (fade < 0.001 || d > 8.0) return vec4(0.0);
  vec3 a = dab(world, seed);
  vec3 b = dab(world + vec2(12.0, 3.5), seed + 3.0);
  vec3 top = a.x > b.x ? a : b;
  float height = max(a.x, b.x);
  float u = (local.x + hs.x) / max(2.0 * hs.x, 1.0);
  float laid = smoothstep(0.0, 0.08, age - top.z * 0.3 - u * 0.35);
  float body = solid(d + (0.5 - height) * 5.0) * smoothstep(0.0, 0.2, age);
  vec3 n = normalize(vec3(-dFdx(height), -dFdy(height), 0.35));
  vec3 light = normalize(vec3(-0.5, -0.6, 0.6));
  float diffuse = clamp(dot(n, light), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 24.0);
  vec3 under = sky(vec3(0.08, 0.13, 0.3), vec3(0.98, 0.91, 0.72));
  vec3 paint = top.y < 0.4 ? sky(vec3(0.1, 0.17, 0.4), vec3(0.98, 0.88, 0.6)) : top.y < 0.8 ? sky(vec3(0.15, 0.26, 0.5), vec3(0.99, 0.93, 0.74)) : sky(vec3(0.08, 0.23, 0.32), vec3(0.87, 0.91, 0.94));
  vec3 color = mix(under, paint, laid * smoothstep(0.05, 0.25, height)) * mix(0.82 + 0.3 * diffuse, 0.93 + 0.12 * diffuse, uLight) + spec * mix(0.18, 0.25, uLight);
  vec4 c = vec4(color, 1.0) * body * 0.96;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
