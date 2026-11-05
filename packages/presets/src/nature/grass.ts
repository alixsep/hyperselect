import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const grass: Preset = {
  name: 'grass',
  pad: [10, 16, 8],
  tint: [0.42, 0.7, 0.18],
  selection: { dark: 'color:#f7fbea;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#142508' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(3.0, 2.0);
  float root = hs.y + 1.0;
  float up = root - local.y;
  float reach = 2.0 * hs.y + 1.0 + 12.0 * (1.0 - cover);
  if (up < -4.0 || up > reach + 1.0 || abs(local.x) > hs.x + 4.0) return vec4(0.0);
  vec2 center = world - local;
  float spread = age * 700.0 - (local.x + hs.x);
  float thatch = smoothstep(0.0, 30.0, spread) * smoothstep(hs.x + 2.0, hs.x - 4.0, abs(local.x)) * smoothstep(-1.0, 2.0, up) * smoothstep(2.0 * hs.y, hs.y * 0.6, up);
  vec3 soil = mix(vec3(0.03, 0.07, 0.02), vec3(0.62, 0.72, 0.5), uLight) * (0.75 + 0.5 * up / (2.0 * hs.y));
  vec4 col = vec4(soil * thatch, thatch) * mix(0.9, 0.55, uLight);
  float gust = smoothstep(0.55, 1.0, 0.5 + 0.5 * sin(world.x * 0.018 - t * 1.3 + seed * 6.0)) * 0.6;
  float cell = floor(world.x / 3.2);
  for (int k = -3; k <= 3; k++) {
    float c = cell + float(k);
    float h = hash(vec2(c, seed * 13.0 + 1.0));
    float x0 = (c + 0.5) * 3.2 + (hash(vec2(c, 4.1)) - 0.5) * 2.6;
    float lx = x0 - center.x;
    if (abs(lx) > hs.x - 1.0) continue;
    float grow = easeOut((age - (lx + hs.x) / 700.0 - h * 0.2) / 0.7) * (0.55 + 0.45 * fade);
    float height = reach * (0.55 + 0.45 * hash(vec2(c, 7.3))) * grow;
    if (height < 1.0) continue;
    float s = (up + 3.0 * hash(vec2(c, 2.7))) / height;
    if (s < 0.0 || s > 1.0) continue;
    float wind = sin(t * 1.3 - x0 * 0.016 + h * 2.0) * 0.07 + sin(t * 2.3 + h * 40.0) * 0.02 + gust * 0.08;
    float tip = clamp(((h - 0.5) * 0.3 + wind) * height, -9.0, 9.0);
    float dx = world.x - x0 - tip * s * s;
    float width = 1.6 * pow(1.0 - s, 0.7) + 0.15;
    float blade = smoothstep(0.6, -0.6, abs(dx) - width);
    if (blade <= 0.0) continue;
    float depth = hash(vec2(c, 9.9));
    vec3 low = mix(vec3(0.06, 0.16, 0.04), vec3(0.42, 0.58, 0.3), uLight);
    vec3 high = mix(mix(vec3(0.3, 0.52, 0.12), vec3(0.48, 0.6, 0.18), step(0.8, depth)), mix(vec3(0.72, 0.84, 0.52), vec3(0.82, 0.86, 0.58), step(0.8, depth)), uLight);
    vec3 green = mix(low, high, smoothstep(0.0, 0.9, s));
    green *= (0.7 + 0.3 * depth) * (dx < 0.0 ? 1.08 : 0.86);
    green += mix(vec3(0.12, 0.14, 0.05), vec3(0.06, 0.06, 0.03), uLight) * gust * s;
    col = over(col, green, blade);
  }
  return col * fade;
}`,
}
