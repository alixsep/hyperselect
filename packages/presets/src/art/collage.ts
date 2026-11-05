import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const collage: Preset = {
  name: 'collage',
  pad: [22, 16, 16],
  tint: [0.82, 0.66, 0.46],
  selection: { dark: 'color:#fffaf2;text-shadow:0 1px 2px rgb(0 0 0 / .5)', light: 'color:#1e160c' },
  surface: /* glsl */ `${studio}
vec3 paper(float kind, vec2 q, vec2 p) {
  if (kind < 1.0) return sky(vec3(0.32, 0.22, 0.12), vec3(0.86, 0.74, 0.56)) * (0.94 + 0.12 * tooth(p * 0.7));
  if (kind < 2.0) {
    float words = step(0.35, noise(vec2(p.x * 0.18, floor(q.y / 3.0) * 3.1))) * stroke(mod(q.y, 3.0) - 1.5, 0.45);
    return mix(sky(vec3(0.26, 0.26, 0.25), vec3(0.93, 0.92, 0.88)), sky(vec3(0.45, 0.45, 0.44), vec3(0.6, 0.6, 0.6)), words * 0.22);
  }
  if (kind < 3.0) return sky(vec3(0.12, 0.2, 0.32), vec3(0.78, 0.88, 0.96));
  vec2 g = abs(mod(q, 6.0) - 3.0);
  float grid = 1.0 - smoothstep(2.4, 2.9, max(g.x, g.y));
  return mix(sky(vec3(0.2, 0.22, 0.24), vec3(0.97, 0.97, 0.95)), sky(vec3(0.24, 0.34, 0.44), vec3(0.62, 0.78, 0.9)), (1.0 - grid) * 0.5);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 16.0 || abs(local.y) > hs.y + 12.0) return vec4(0.0);
  float span = 2.0 * hs.x + 12.0;
  float count = max(1.0, floor(span / 90.0));
  float w = span / count;
  float k0 = floor((local.x + hs.x + 6.0) / w);
  vec4 c = vec4(0.0);
  for (int j = -1; j <= 1; j++) {
    float k = k0 + float(j);
    if (k < 0.0 || k > count - 1.0) continue;
    vec2 h = hash2(vec2(k, seed * 91.0));
    vec2 center = vec2(-hs.x - 6.0 + (k + 0.5) * w, (h.x - 0.5) * 3.0);
    vec2 q = rotate(local - center, (h.y - 0.5) * 0.07);
    float torn = (noise(q * 0.35 + k * 7.0) - 0.5) * 3.5 + (noise(q * 1.5) - 0.5) * 1.0;
    float dd = sdBox(q, vec2(w * 0.5 + 6.0, hs.y + 2.5 + h.x * 2.0)) + torn;
    float drop = smoothstep(0.0, 0.18, age - h.y * 0.2 - k * 0.05);
    float lift = (1.0 - drop) * 3.0;
    c = over(c, vec3(0.0), smoothstep(4.0, -1.0, dd - 1.5 - lift * 2.0) * drop * mix(0.35, 0.12, uLight));
    vec3 color = paper(floor(hash(vec2(k, seed * 37.0 + 4.0)) * 4.0), q, world);
    float fibers = stroke(dd + 1.0, 0.9) * step(0.45, noise(q * 1.2 + 3.0));
    color = mix(color, sky(vec3(0.7, 0.68, 0.64), vec3(1.0)), fibers * 0.7);
    c = over(c, color, solid(dd + lift) * drop);
  }
  vec2 tq = rotate(local - vec2(-hs.x + 2.0, -hs.y), 0.6);
  float tape = solid(max(sdBox(tq, vec2(11.0, 3.8)), abs(tq.x) - 10.0 + (noise(vec2(tq.y * 2.0, seed)) - 0.5) * 2.0));
  c = over(c, sky(vec3(0.62, 0.58, 0.45), vec3(0.97, 0.93, 0.78)), tape * smoothstep(0.35, 0.5, age) * (1.0 - cover) * step(40.0, hs.x) * mix(0.4, 0.55, uLight));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
