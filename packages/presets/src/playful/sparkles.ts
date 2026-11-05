import type { Preset } from 'hyperselect'
import { rise } from '../motion'
import { festive, tone } from './shared'
import { twinkle } from './sparkle'

export const sparkles: Preset = {
  name: 'sparkles',
  pad: [30, 34, 26],
  tint: [0.8, 0.62, 1],
  selection: { dark: 'color:#fbf7ff;text-shadow:0 0 10px rgb(190 150 255 / .55)', light: 'color:#24143a' },
  surface: /* glsl */ `${festive}
${twinkle}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  if (fade < 0.001 || d > 34.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.3, age);
  float body = solid(d) * open;
  float aura = exp(-max(d, 0.0) / 10.0) * open;
  float sheen = fbm3(world * 0.03 + vec2(t * 0.15, 0.0));
  vec3 velvet = sky(mix(vec3(0.13, 0.07, 0.24), vec3(0.22, 0.1, 0.3), sheen), mix(vec3(0.95, 0.9, 1.0), vec3(1.0, 0.92, 0.97), sheen));
  vec4 c = vec4(velvet, 1.0) * body * 0.9;
  c += vec4(sky(vec3(0.35, 0.2, 0.6), vec3(0.0)), 0.0) * aura * (1.0 - body) * 0.35;
  vec2 g = world / 13.0 + seed * 3.0;
  vec2 id = floor(g);
  vec2 q = (fract(g) - 0.5 - (hash2(id) - 0.5) * 0.6) * 13.0;
  float beat = pow(max(sin(t * (1.5 + hash(id) * 2.0) + hash(id + 2.0) * 6.2832), 0.0), 6.0);
  float spark = twinkle(q / (2.0 + 2.5 * hash(id + 4.0)), 7.0) * beat * step(0.5, hash(id + 6.0));
  vec3 color = mix(vec3(1.0, 0.95, 0.8), vec3(0.85, 0.7, 1.0), hash(id + 8.0));
  c += vec4(sky(color, color * vec3(0.55, 0.4, 0.8)), sky(vec3(0.0), vec3(0.7))) * clamp(spark, 0.0, 1.0) * smoothstep(30.0, 0.0, d) * open;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
${twinkle}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float pulse = sin(life * 3.1416);
  vec2 q = p / max(pulse, 0.05);
  float s = twinkle(q * 1.4, 9.0) * pulse;
  vec3 c = mix(vec3(1.0, 0.94, 0.75), vec3(0.82, 0.66, 1.0), seed);
  vec3 ink = sky(c, c * vec3(0.5, 0.36, 0.8));
  float a = clamp(s, 0.0, 1.0) * alpha;
  return vec4(ink * a * 1.2, a * uLight);
}`,
  behavior: rise({ rate: 7, speed: [6, 22], wobble: 8, size: [10, 26], life: [0.7, 1.5] }),
}
