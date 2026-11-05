import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const aurora: Preset = {
  name: 'aurora',
  pad: [16, 40, 10],
  tint: [0.2, 0.95, 0.6],
  selection: { dark: 'color:#f0fff8;text-shadow:0 1px 3px rgb(0 20 18 / .9)', light: 'color:#04291f' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float x = world.x;
  float hem = hs.y - 3.0 + (fbm3(vec2(x * 0.007 + t * 0.06, seed * 5.0)) - 0.5) * 9.0;
  float up = hem - local.y;
  if (up < -4.0) return vec4(0.0);
  float grow = easeOut(age * 1.3);
  float reach = (2.0 * hs.y + mix(34.0, 2.0, cover)) * grow;
  float h = up / max(reach, 1.0);
  if (h > 1.0) return vec4(0.0);
  float sway = fbm3(vec2(x * 0.008 - t * 0.07, t * 0.05 + seed * 3.0));
  float rx = x + sway * 90.0;
  float rays = noise(vec2(rx * 0.16, t * 0.25 + up * 0.008)) * 0.6 + noise(vec2(rx * 0.43, t * 0.4 - up * 0.01)) * 0.4;
  rays = 0.35 + 0.65 * smoothstep(0.3, 0.8, rays);
  float fold = 0.55 + 0.45 * noise(vec2(x * 0.018 - t * 0.35, seed * 7.0 + t * 0.1));
  float hemEdge = smoothstep(-3.0, 1.0, up);
  float body = hemEdge * (exp(-max(up, 0.0) / 5.0) * 0.8 + (1.0 - h) * sqrt(1.0 - h) * 0.75);
  float sides = smoothstep(hs.x + 8.0, hs.x - 26.0, abs(local.x));
  float k = body * rays * fold * sides * smoothstep(0.0, 0.35, age);
  vec3 green = vec3(0.2, 1.0, 0.55), teal = vec3(0.1, 0.7, 0.75), violet = vec3(0.55, 0.25, 0.95);
  vec3 col = mix(green, teal, smoothstep(0.05, 0.35, h));
  col = mix(col, violet, smoothstep(0.3, 0.8, h));
  if (uLight > 0.5) {
    vec3 deep = mix(vec3(0.04, 0.6, 0.4), vec3(0.08, 0.5, 0.58), smoothstep(0.05, 0.35, h));
    deep = mix(deep, vec3(0.45, 0.32, 0.82), smoothstep(0.3, 0.8, h));
    float a = clamp(k * 0.95, 0.0, 0.9);
    return vec4(deep * a, a) * fade;
  }
  return vec4(col * k * 1.2 * fade, k * 0.3 * fade);
}`,
}
