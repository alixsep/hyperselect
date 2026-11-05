import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const gingerbread: Preset = {
  name: 'gingerbread',
  pad: [18, 12, 12],
  tint: [0.78, 0.48, 0.24],
  selection: { dark: 'color:#fff7ee;text-shadow:0 1px 2px rgb(40 16 2 / .6)', light: 'color:#2a1406' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 3.0);
  float d = sdRBox(local, hs, 8.0);
  if (fade < 0.001 || d > 6.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float baked = smoothstep(-7.0, 0.0, d);
  vec3 dough = sky(vec3(0.36, 0.19, 0.08), vec3(0.9, 0.71, 0.5));
  dough *= 1.0 - baked * 0.28 + (noise(world * 0.35 + seed) - 0.5) * 0.08;
  vec4 c = vec4(dough, 1.0) * body * 0.95;
  vec3 v = voronoi(world * 0.33 + seed * 3.0);
  c = over(c, dough * 0.55, smoothstep(0.16, 0.06, v.x) * step(0.55, v.z) * body * 0.5);

  float s = local.x + local.y;
  float path = d + 4.6 - abs(sin(s * PI / 6.0)) * 2.0;
  float piped = smoothstep(0.0, 10.0, age * 520.0 - (local.x + hs.x) - (local.y + hs.y) * 0.4);
  float icing = stroke(path, 0.95) * piped;
  float shade = stroke(sdRBox(local - vec2(0.5, 0.8), hs, 8.0) + 4.6 - abs(sin((s - 1.3) * PI / 6.0)) * 2.0, 1.0) * piped;
  c = over(c, dough * 0.45, shade * (1.0 - icing) * body * 0.6);
  c = over(c, sky(vec3(0.98, 0.96, 0.93), vec3(1.0, 0.99, 0.97)), icing * body);
  c = over(c, vec3(0.82, 0.78, 0.74), icing * smoothstep(-0.2, 0.9, path) * body * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
