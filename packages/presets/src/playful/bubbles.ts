import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'

export const bubbles: Preset = {
  name: 'bubbles',
  pad: [22, 40, 18],
  tint: [0.45, 0.82, 0.92],
  selection: { dark: 'color:#f2fcff', light: 'color:#0e2630' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.25, age);
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.05, 0.16, 0.22), vec3(0.03, 0.1, 0.16), depth), mix(vec3(0.84, 0.95, 0.98), vec3(0.74, 0.9, 0.95), depth)), 1.0) * body * 0.9;
  float film = smoothstep(-5.0, 0.0, d) * (0.5 + 0.5 * sin(world.x * 0.03 + local.y * 0.2 + t * 0.8));
  c = over(c, rainbow(world.x * 0.004 + t * 0.05 + seed) * 0.6 + 0.4, film * body * 0.3);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float popping = smoothstep(0.9, 1.0, life);
  float r = length(p) / (0.9 + 0.08 * params.y * (1.0 - popping));
  float film = smoothstep(1.0, 0.97, r) * (0.18 + 0.82 * pow(r, 6.0));
  vec3 sheen = rainbow(r * 0.9 + p.y * 0.4 + seed + t * 0.15);
  vec2 w = p - vec2(-0.38, 0.42);
  float window = smoothstep(0.24, 0.12, length(w * vec2(1.0, 1.5)));
  float glint = smoothstep(0.1, 0.03, length(p - vec2(0.42, -0.4)));
  float a = (film * (1.0 - popping) + (window + glint * 0.7) * (1.0 - popping)) * alpha;
  float ring = smoothstep(0.08, 0.0, abs(r - 1.0 - popping * 0.3)) * popping * (1.0 - popping) * 4.0;
  float shine = window + glint * 0.7;
  vec3 ink = mix(sheen, vec3(1.0), 0.45) * film + shine;
  ink = sky(ink, mix(ink * 0.55, vec3(0.2, 0.5, 0.6), 0.3 * film));
  float strength = mix(0.55, 0.85, uLight);
  return vec4((ink * (1.0 - popping) + vec3(0.9, 1.0, 1.0) * ring) * alpha * strength, clamp(a + ring * alpha, 0.0, 1.0) * strength);
}`,
  behavior: rise({ rate: 2.6, speed: [24, 55], wobble: 16, size: [12, 26], life: [1.8, 3.2] }),
}
