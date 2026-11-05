import type { Preset } from 'hyperselect'
import { toss } from '../motion'
import { festive, tone } from './shared'

export const firecracker: Preset = {
  name: 'firecracker',
  pad: [26, 30, 16],
  tint: [0.92, 0.18, 0.14],
  selection: { dark: 'color:#fff4dc;text-shadow:0 1px 2px rgb(40 0 0 / .7)', light: 'color:#3a0606' },
  surface: /* glsl */ `${festive}
float fret(vec2 p) {
  float wave = sign(sin(p.x * PI / 4.0)) * 1.4;
  float level = abs(p.y - wave);
  float riser = abs(fract(p.x / 4.0 + 0.5) - 0.5) * 4.0 + max(abs(p.y) - 1.4, 0.0) * 9.0;
  return min(level, riser);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float lacquer = smoothstep(-hs.y, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.46, 0.05, 0.06), vec3(0.34, 0.03, 0.04), lacquer), mix(vec3(1.0, 0.9, 0.86), vec3(0.99, 0.86, 0.82), lacquer)), 1.0) * body * 0.94;
  vec3 gold = sky(vec3(1.0, 0.78, 0.32), vec3(0.78, 0.5, 0.08));
  c = over(c, gold, stroke(d + 1.0, 0.5) * body);
  c = over(c, gold, stroke(d + 2.8, 0.25) * body * 0.6);
  float band = smoothstep(-hs.y * 0.6, -hs.y * 0.9, -abs(local.y)) * step(abs(local.x), hs.x - 6.0);
  float pattern = stroke(fret(vec2(world.x, abs(local.y) - hs.y + 5.0)), 0.35) * smoothstep(2.6, 1.6, abs(abs(local.y) - hs.y + 5.0));
  c = over(c, gold, pattern * band * body * smoothstep(0.0, 0.4, age) * 0.5 * step(8.0, hs.y));
  float flash = exp(-age * 9.0) * exp(-abs(d) / 6.0);
  c.rgb += vec3(1.0, 0.75, 0.4) * flash * (1.0 - uLight);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  if (kind > 0.5) {
    float g = clamp(glint(p, 0.9), 0.0, 1.0) * alpha;
    vec3 spark = sky(vec3(1.0, 0.85, 0.45), vec3(0.9, 0.55, 0.08));
    return vec4(spark * g, g * mix(0.3, 0.9, uLight));
  }
  float flip = params.y;
  vec2 q = vec2(p.x / max(abs(flip), 0.15), p.y);
  float scrap = sdBox(q, vec2(0.45, 0.7));
  float paper = solid(scrap);
  vec3 red = mix(vec3(0.7, 0.06, 0.08), vec3(0.95, 0.2, 0.18), flip * 0.5 + 0.5);
  red = mix(red, vec3(1.0, 0.75, 0.3), solid(abs(scrap + 0.12) - 0.08) * 0.8);
  return vec4(red * paper * alpha, paper * alpha);
}`,
  behavior: toss({ burst: 12, rate: 1.6, speed: [140, 300], spread: 0.9, gravity: 380, drag: 2, size: [5, 9], life: [0.8, 1.4], spin: 8, flutter: 220, variants: 2 }),
}
