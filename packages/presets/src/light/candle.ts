import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const candle: Preset = {
  name: 'candle',
  pad: [28, 14, 10],
  tint: [1.0, 0.66, 0.28],
  selection: { dark: 'color:#fff5e4;text-shadow:0 1px 2px rgb(30 12 0 / .8)', light: 'color:#3a1d04' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  vec2 wick = vec2(-hs.x - 12.0, 7.0);
  float lit = easeOut(age * 2.5);
  float flicker = 0.9 + 0.1 * noise(vec2(t * 2.2, seed * 11.0));
  float sway = (noise(vec2(t * 1.3, seed * 5.0)) - 0.5) * 2.4;
  vec2 q = local - wick;
  float up = max(-q.y, 0.0);
  q.x -= sway * up * 0.09;
  q /= mix(0.3, 1.0, lit) * (0.94 + 0.06 * flicker);
  float flameD = length(vec2(q.x * (1.0 + up * 0.1), q.y * (q.y < 0.0 ? 0.22 : 0.9))) - 4.2;
  float flame = solid(flameD);
  float heart = smoothstep(-0.5, -2.6, flameD);
  float blue = smoothstep(-6.0, 2.0, q.y) * flame;
  float stub = solid(sdBox(local - wick - vec2(0.0, 3.5), vec2(0.5, 2.0)));
  float box = sdRBox(local, hs, 5.0);
  float inside = solid(box);
  vec2 rel = (local - wick) * vec2(1.0, 1.6);
  float radius = mix(30.0, 150.0, lit);
  float pool = radius * radius / (radius * radius + dot(rel, rel));
  float spill = exp(-max(box, 0.0) / 8.0) * (1.0 - inside) * 0.35;
  float halo = exp(-length(rel + vec2(0.0, 8.0)) / 12.0);
  float light = pool * flicker;
  vec3 amber = vec3(1.0, 0.6, 0.22), cream = vec3(1.0, 0.9, 0.66);
  vec3 flameCol = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.95, 0.78), heart);
  flameCol = mix(flameCol, vec3(0.35, 0.45, 1.0), blue * 0.5);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(1.0, 0.82, 0.56), 1.0) * clamp((inside * 0.62 + spill) * light * lit + halo * 0.5 * lit, 0.0, 1.0);
    c = over(c, vec3(0.25, 0.15, 0.1), stub);
    c = over(c, mix(vec3(0.95, 0.42, 0.06), vec3(1.0, 0.82, 0.4), heart), flame);
    return c * fade;
  }
  vec3 rgb = mix(amber, cream, pool * 0.6) * (inside * 0.5 + spill) * light * lit;
  rgb += amber * halo * 0.7 * lit * flicker + vec3(0.3, 0.2, 0.15) * stub * 0.5;
  rgb = rgb * (1.0 - flame) + flameCol * flame * 1.2;
  return vec4(rgb * fade, (inside * 0.4 * lit + flame) * fade);
}`,
}
