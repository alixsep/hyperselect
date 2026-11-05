import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const halloween: Preset = {
  name: 'halloween',
  pad: [22, 38, 16],
  tint: [1.0, 0.56, 0.16],
  selection: { dark: 'color:#fff1e2;text-shadow:0 1px 2px rgb(20 4 24 / .6)', light: 'color:#2a1205' },
  surface: /* glsl */ `${festive}
float cobweb(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x) / (PI * 0.5) * 4.0;
  float spoke = abs(fract(a + 0.5) - 0.5) * r * (PI * 0.125) + max(r - 24.0, 0.0);
  float sag = 1.0 - 0.16 * sin(fract(a) * PI);
  float rs = r / sag;
  float ring = abs(fract(rs / 6.0 + 0.5) - 0.5) * 6.0 * sag + (step(21.0, rs) + step(rs, 3.0)) * 99.0;
  return min(spoke, ring);
}

float oval(vec2 p, vec2 r) {
  return (length(p / r) - 1.0) * min(r.x, r.y);
}

vec4 lantern(vec2 q, float r, float t, float seed) {
  float gourd = min(oval(q, vec2(0.55, 0.86) * r), oval(vec2(abs(q.x) - 0.42 * r, q.y + 0.02 * r), vec2(0.6, 0.8) * r));
  float rib = stroke(abs(q.x) - 0.3 * r * (1.0 - q.y * q.y / (r * r)), 0.25) * smoothstep(0.5 * r, -0.5 * r, gourd);
  vec3 skin = sky(vec3(0.86, 0.4, 0.07), vec3(0.95, 0.5, 0.1)) * (1.05 - 0.4 * smoothstep(0.2 * r, r, length(q * vec2(0.8, 1.0))));
  skin = mix(skin, skin * 0.68, rib);
  vec4 c = vec4(skin, 1.0) * solid(gourd);
  float stem = sdBox(q - vec2(0.08 * r - q.y * 0.25, -0.98 * r), vec2(0.11, 0.2) * r);
  c = over(c, sky(vec3(0.32, 0.36, 0.14), vec3(0.3, 0.34, 0.12)), solid(stem));
  vec2 e = vec2(abs(q.x) - 0.33 * r, q.y + 0.12 * r);
  float eyes = max(e.y - 0.12 * r, abs(e.x) * 1.5 - e.y - 0.2 * r) * 0.5;
  vec2 m = q - vec2(0.0, 0.36 * r);
  float bend = -0.4 * m.x * m.x / r;
  float grin = max(abs(m.x) - 0.44 * r, abs(m.y - bend) - 0.1 * r);
  grin = max(grin, -sdBox(vec2(abs(m.x) - 0.16 * r, m.y - bend + 0.1 * r), vec2(0.06, 0.05) * r));
  float flick = 0.75 + 0.25 * noise(vec2(t * 7.0, seed * 13.0));
  vec3 candle = mix(vec3(1.0, 0.55, 0.1), vec3(1.0, 0.9, 0.45), flick);
  c = over(c, candle * mix(0.7, 1.0, flick), solid(min(eyes, grin)) * solid(gourd));
  c.rgb += vec3(1.0, 0.5, 0.1) * exp(-length(q) / (r * 1.4)) * smoothstep(1.7 * r, 0.8 * r, length(q)) * flick * (1.0 - uLight) * 0.3;
  return c;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.11, 0.05, 0.14), vec3(1.0, 0.93, 0.84)), 1.0) * body * 0.92;
  float flick = 0.8 + 0.2 * noise(vec2(t * 5.0, seed * 9.0)) + 0.06 * sin(t * 23.0 + seed);
  float glow = exp(-(hs.y - local.y) / max(hs.y * 0.8, 1.0)) * flick;
  c = over(c, sky(vec3(0.95, 0.42, 0.08), vec3(1.0, 0.62, 0.25)), glow * body * mix(0.42, 0.38, uLight));
  float rim = stroke(d + 0.8, 0.45) * smoothstep(-hs.y * 0.2, hs.y, local.y);
  c = over(c, sky(vec3(1.0, 0.6, 0.2), vec3(0.85, 0.38, 0.06)), rim * flick * smoothstep(0.0, 0.3, age) * 0.8);
  float spun = smoothstep(0.0, 0.5, age - 0.1);
  float web = stroke(cobweb(vec2(hs.x - local.x, local.y + hs.y) / mix(0.4, 1.0, spun)), 0.3);
  web *= (1.0 - cover) * step(40.0, hs.x) * smoothstep(1.0, -1.0, d) * spun;
  c = over(c, sky(vec3(0.82, 0.78, 0.9), vec3(0.32, 0.26, 0.38)), web * 0.6);
  float slot = floor(world.x / 46.0);
  float h = hash(vec2(slot, seed + 11.0));
  float r = mix(7.0, 9.5, fract(h * 5.3));
  vec2 q = vec2(mod(world.x, 46.0) - 23.0 - (h - 0.5) * 14.0, local.y + hs.y + r * 0.82 - 1.5);
  float grown = smoothstep(0.0, 0.3, age - 0.2 - fract(slot * 0.618) * 0.5);
  float x = local.x - q.x;
  float placed = (1.0 - cover) * step(0.35, h) * step(-hs.x + 12.0, x) * step(x, hs.x - 36.0) * step(40.0, hs.x) * grown;
  c = layer(c, lantern(q / mix(0.7, 1.0, grown), r, t, slot) * placed);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float flap = sin(t * 15.0 + seed * 40.0);
  vec2 q = vec2(abs(p.x), p.y);
  q.y -= q.x * flap * 0.5;
  float top = 0.12 + q.x * 0.3;
  float hem = q.x * 0.32 - 0.22 + 0.16 * (1.0 - abs(sin((q.x - 0.15) * 7.5)));
  float wing = max(max(q.y - top, hem - q.y), q.x - 0.95);
  float torso = length((p - vec2(0.0, 0.05)) * vec2(1.9, 1.0)) - 0.24;
  float head = length(p - vec2(0.0, 0.3)) - 0.13;
  float ear = length((vec2(abs(p.x), p.y) - vec2(0.07, 0.43)) * vec2(2.2, 1.0)) - 0.09;
  float bat = solid(min(min(wing, torso), min(head, ear)));
  vec3 color = sky(vec3(0.46, 0.32, 0.56), vec3(0.17, 0.08, 0.2));
  float a = bat * alpha * 0.95;
  return vec4(color * a, a);
}`,
  behavior: rise({ rate: 0.5, speed: [34, 60], wobble: 18, size: [10, 15], life: [1.4, 2.2] }),
}
