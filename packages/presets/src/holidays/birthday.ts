import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const birthday: Preset = {
  name: 'birthday',
  pad: [20, 42, 16],
  tint: [0.98, 0.5, 0.7],
  selection: { dark: 'color:#fff6fa;text-shadow:0 1px 2px rgb(30 0 20 / .6)', light: 'color:#2c0c22' },
  surface: /* glsl */ `${festive}
vec3 wax(float k) {
  return k < 1.0 ? vec3(1.0, 0.45, 0.62) : k < 2.0 ? vec3(0.36, 0.66, 1.0) : k < 3.0 ? vec3(1.0, 0.78, 0.25) : vec3(0.36, 0.84, 0.66);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 7.0);
  if (fade < 0.001 || d > 22.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.2, 0.08, 0.17), vec3(1.0, 0.93, 0.95)), 1.0) * body * 0.92;

  float ribbon = 0.0;
  vec3 shade = vec3(0.0);
  for (int i = 0; i < 2; i++) {
    float phase = float(i) * PI + seed * 6.0;
    float y = hs.y + 0.5 + sin(world.x * 0.16 + phase) * 2.2;
    float twist = 0.25 + 0.75 * abs(cos(world.x * 0.16 + phase));
    float r = stroke(local.y - y, 0.4 + 0.6 * twist) * step(abs(local.x), hs.x - 4.0);
    vec3 hue = i == 0 ? sky(vec3(1.0, 0.5, 0.68), vec3(0.95, 0.4, 0.6)) : sky(vec3(0.3, 0.8, 0.82), vec3(0.15, 0.62, 0.68));
    float front = step(0.0, sin(world.x * 0.16 + phase) * (i == 0 ? 1.0 : -1.0));
    shade = mix(shade, hue * (0.75 + 0.25 * twist), r * max(front, 1.0 - ribbon));
    ribbon = max(ribbon, r);
  }
  c = over(c, shade, ribbon * smoothstep(0.0, 12.0, age * 500.0 - local.x - hs.x));

  float count = max(floor(hs.x * 2.0 / 30.0), 1.0);
  float gap = hs.x * 2.0 / count;
  float k = clamp(floor((local.x + hs.x) / gap), 0.0, count - 1.0);
  vec2 q = vec2(local.x + hs.x - (k + 0.5) * gap, local.y + hs.y);
  float shape = sdRBox(q + vec2(0.0, 5.5), vec2(1.6, 5.5), 0.8);
  float candle = solid(shape) * step(40.0, hs.x);
  float stripe = step(0.5, fract((q.y - q.x * 1.2) / 3.4));
  vec3 color = mix(wax(mod(k, 4.0)), vec3(1.0), stripe * 0.85) * (0.82 + 0.18 * smoothstep(1.6, -1.6, q.x));
  c = over(c, sky(vec3(0.0), vec3(0.4, 0.2, 0.3)), stroke(shape, 0.2) * step(40.0, hs.x) * uLight * 0.6);
  c = over(c, color, candle);
  c = over(c, sky(vec3(0.3, 0.25, 0.22), vec3(0.2, 0.16, 0.14)), solid(sdBox(q + vec2(0.0, 12.0), vec2(0.3, 1.0))) * step(40.0, hs.x));
  float lit = smoothstep(0.0, 0.2, age - 0.3 - k * 0.12) * step(40.0, hs.x);
  vec4 glow = fire(vec2(q.x, -q.y - 13.0), 1.9, t, k + seed) * lit;
  c.rgb += vec3(1.0, 0.7, 0.35) * exp(-length(q + vec2(0.0, 15.0)) / 9.0) * lit * (1.0 - uLight) * 0.3;
  c = layer(c, glow);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
