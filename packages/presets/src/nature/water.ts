import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const water: Preset = {
  name: 'water',
  pad: [12, 10, 12],
  tint: [0.2, 0.6, 0.82],
  selection: { dark: 'color:#f0fbff;text-shadow:0 1px 2px rgb(0 20 40 / .7)', light: 'color:#06283a' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 3.0);
  float box = sdRBox(local, hs, 6.0);
  if (box > 10.0) return vec4(0.0);
  float fill = easeOut(age * 1.4 - (local.x + hs.x) * 0.0006) * (0.15 + 0.85 * fade);
  float swell = sin(world.x * 0.045 + t * 1.7 + seed * 6.0) * 1.1 + sin(world.x * 0.11 - t * 2.4) * 0.5;
  float level = hs.y - (2.0 * hs.y + 4.0 * (1.0 - cover)) * fill + swell * (0.4 + 0.6 * fill) * (1.0 - cover);
  float d = max(box, level - local.y);
  float aa = fwidth(local.y) * 0.8;
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(sdRBox(local - vec2(0.0, 3.0), hs, 6.0), 0.0) / 6.0) * (1.0 - inside) * mix(0.35, 0.1, uLight) * fill;
  if (inside <= 0.0) return vec4(vec3(0.0, 0.02, 0.04) * sh, sh) * fade;
  float depth = clamp((local.y - level) / (2.0 * hs.y), 0.0, 1.0);
  vec3 shallow = mix(vec3(0.07, 0.36, 0.46), vec3(0.62, 0.86, 0.92), uLight);
  vec3 deep = mix(vec3(0.02, 0.1, 0.24), vec3(0.42, 0.66, 0.84), uLight);
  vec3 col = mix(shallow, deep, smoothstep(0.0, 1.0, depth));
  vec2 flow = world * 0.055 + vec2(t * 0.12, t * 0.05) + (vec2(fbm3(world * 0.03 + t * 0.1), fbm3(world * 0.03 + 5.0 - t * 0.08)) - 0.5) * 1.4;
  vec3 v = voronoi(flow);
  float caustic = smoothstep(0.12, 0.0, v.y - v.x) * (1.0 - 0.7 * depth);
  col += mix(vec3(0.3, 0.55, 0.6), vec3(1.0, 1.0, 1.0), uLight) * caustic * mix(0.12, 0.14, uLight);
  float streak = smoothstep(0.62, 0.9, noise(vec2(world.x * 0.025 - t * 0.35, world.y * 0.35 + seed * 9.0)));
  col += vec3(0.6, 0.85, 0.9) * streak * mix(0.12, 0.16, uLight);
  float meniscus = exp(-abs(local.y - level - 1.2) / 0.9) * (1.0 - cover);
  float sheen = smoothstep(6.0, 0.0, local.y - level) * (1.0 - cover);
  col = mix(col, mix(vec3(0.5, 0.82, 0.9), vec3(0.95, 1.0, 1.0), uLight), sheen * 0.25);
  col += vec3(0.75, 0.95, 1.0) * meniscus * mix(0.55, 0.45, uLight);
  float cell = floor(world.x / 26.0);
  float bh = hash(vec2(cell, seed * 5.0 + 2.0));
  float rise = fract(t * (0.15 + 0.1 * bh) + bh * 7.0);
  vec2 bubble = vec2((cell + 0.5) * 26.0 + sin(t * 2.0 + bh * 30.0) * 2.5 - (world.x - local.x), hs.y - 2.0 - rise * (hs.y * 2.0 + 4.0));
  float br = 1.1 + 1.3 * hash(vec2(cell, 1.7));
  float bd = length(local - bubble) - br;
  float bubbleRing = step(0.45, bh) * smoothstep(0.6, -0.2, abs(bd + 0.3) - 0.3) * smoothstep(0.0, 0.15, rise) * step(level + 2.0, bubble.y);
  col += vec3(0.8, 0.95, 1.0) * bubbleRing * 0.5;
  col *= 1.0 - 0.25 * smoothstep(-4.0, 0.0, box) * (1.0 - uLight);
  float a = mix(0.86, 0.8, uLight) * inside;
  return vec4(col * a, a) * fade;
}`,
}
