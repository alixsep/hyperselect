import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const vhs: Preset = {
  name: 'vhs',
  pad: [18, 26, 12],
  tint: [0.6, 0.55, 0.95],
  selection: { dark: 'color:#f6f4ff;text-shadow:-1px 0 rgb(255 60 120 / .45),1px 0 rgb(60 200 255 / .45)', light: 'color:#16122a' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float tick = floor(t * 15.0);
  vec2 p = local + vec2((hash(vec2(tick, seed)) - 0.5) * 0.9, 0.0);
  float head = smoothstep(hs.y - 3.0, hs.y, p.y);
  p.x += head * (noise(vec2(world.y * 0.8, t * 30.0)) - 0.5) * 8.0;
  float d = sdRBox(p, hs, 2.0);
  if (fade < 0.001 || d > 26.0) return vec4(0.0);
  float soft = 1.6;
  vec3 bodies = vec3(1.0 - smoothstep(-soft, soft, sdRBox(p - vec2(1.8, 0.0), hs, 2.0)), 1.0 - smoothstep(-0.7, 0.7, d), 1.0 - smoothstep(-soft, soft, sdRBox(p + vec2(1.8, 0.0), hs, 2.0)));
  bodies *= smoothstep(0.0, 0.15, age);
  vec3 base = sky(vec3(0.14, 0.12, 0.2), vec3(0.94, 0.93, 0.97));
  float roll = mod(local.y + hs.y - t * 18.0 + seed * 40.0, hs.y * 2.0 + 60.0);
  float band = smoothstep(5.0, 0.0, abs(roll - 4.0));
  float streak = step(0.72, hash(vec2(floor(world.x / (2.0 + hash(vec2(floor(world.y), tick)) * 18.0)), floor(world.y) + tick)));
  vec3 noiseColor = sky(vec3(0.75, 0.75, 0.85), vec3(0.4, 0.38, 0.5));
  vec3 col = base * bodies.y + sky(vec3(0.35, 0.02, 0.12), vec3(0.95, 0.4, 0.55)) * bodies.x * (1.0 - bodies.y) + sky(vec3(0.02, 0.18, 0.3), vec3(0.35, 0.7, 0.95)) * bodies.z * (1.0 - bodies.y);
  float a = max(max(bodies.x, bodies.y), bodies.z);
  vec4 c = vec4(col, a) * 0.94;
  c = over(c, noiseColor, band * streak * bodies.y * 0.6);
  c = over(c, noiseColor, head * bodies.y * step(0.5, hash(vec2(floor(world.x / 3.0), tick))) * 0.35);
  vec2 osd = local - vec2(-hs.x + 2.0, -hs.y - 13.0);
  float play = solid(max(-osd.x, abs(osd.y - 3.75) + osd.x * 0.6 - 3.75));
  float clock = floor(age);
  float digits[6] = float[6](floor(clock / 600.0), mod(floor(clock / 60.0), 10.0), 0.0, floor(mod(clock, 60.0) / 10.0), mod(clock, 10.0), 0.0);
  float text = 0.0;
  for (int k = 0; k < 5; k++) {
    vec2 q = osd - vec2(12.0 + float(k) * 6.0, 0.0);
    if (k == 2) text += solid(length(q - vec2(2.25, 1.5)) - 0.8) + solid(length(q - vec2(2.25, 6.0)) - 0.8);
    else text += digit(q, int(digits[k]), 1.5);
  }
  float osdOn = (1.0 - cover) * step(40.0, hs.x) * smoothstep(0.0, 0.2, age);
  vec3 osdColor = sky(vec3(0.95, 0.97, 1.0), vec3(0.2, 0.18, 0.4));
  c = over(c, osdColor, clamp(play + text, 0.0, 1.0) * osdOn);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
