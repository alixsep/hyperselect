import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const hanukkah: Preset = {
  name: 'hanukkah',
  pad: [18, 40, 12],
  tint: [0.45, 0.62, 1.0],
  selection: { dark: 'color:#f2f6ff;text-shadow:0 1px 2px rgb(0 4 30 / .7)', light: 'color:#0a1638' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 22.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.04, 0.07, 0.22), vec3(0.9, 0.93, 1.0)), 1.0) * body * 0.93;
  vec3 silver = sky(vec3(0.78, 0.84, 0.98), vec3(0.42, 0.5, 0.72));
  c = over(c, silver, stroke(d + 1.4, 0.35) * body * 0.8);
  vec2 w = world / 12.0;
  float lattice = min(abs(fract(w.y) - 0.5), min(abs(fract(w.y * 0.5 + w.x * 0.866) - 0.5), abs(fract(w.y * 0.5 - w.x * 0.866) - 0.5))) * 12.0;
  c = over(c, silver, stroke(lattice, 0.3) * body * smoothstep(-9.0, -1.0, d) * 0.22);

  float gap = min(16.0, hs.x * 2.0 / 10.0);
  float k = clamp(floor(local.x / gap + 0.5), -4.0, 4.0);
  float shamash = 1.0 - step(0.5, abs(k));
  float tall = mix(8.0, 11.0, shamash);
  vec2 q = vec2(local.x - k * gap, local.y + hs.y);
  float order = k > 0.0 ? 4.0 - k : 8.0 + k;
  float lit = smoothstep(0.0, 0.15, age - mix(0.4 + order * 0.16, 0.15, shamash));
  float wax = solid(sdRBox(q + vec2(0.0, tall * 0.5), vec2(1.3, tall * 0.5), 0.6)) * step(40.0, hs.x);
  vec3 candle = mod(k, 2.0) < 1.0 ? sky(vec3(0.92, 0.95, 1.0), vec3(1.0)) : sky(vec3(0.42, 0.6, 1.0), vec3(0.3, 0.48, 0.95));
  candle = mix(candle, silver, shamash * 0.5);
  c = over(c, vec3(0.2, 0.3, 0.55), stroke(sdRBox(q + vec2(0.0, tall * 0.5), vec2(1.3, tall * 0.5), 0.6), 0.25) * step(40.0, hs.x) * uLight * 0.5);
  c = over(c, candle * (0.85 + 0.15 * smoothstep(-1.3, 1.3, -q.x)), wax);
  vec4 glow = fire(vec2(q.x, -q.y - tall - 0.6), 1.6, t, k + seed) * lit * step(40.0, hs.x);
  c.rgb += vec3(1.0, 0.75, 0.4) * exp(-length(q + vec2(0.0, tall + 3.0)) / 8.0) * lit * (1.0 - uLight) * 0.35 * step(40.0, hs.x);
  c = layer(c, glow);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
