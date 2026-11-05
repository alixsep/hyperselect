import type { Preset } from 'hyperselect'
import { drift } from './drift'
import { atmosphere, tone } from './shared'

export const wind: Preset = {
  name: 'wind',
  pad: [40, 30, 26],
  tint: [0.55, 0.82, 0.76],
  selection: { dark: 'color:#f0faf7', light: 'color:#122520' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 8.0);
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.5, age);
  float body = solid(d) * open;
  vec3 air = sky(mix(vec3(0.05, 0.13, 0.13), vec3(0.08, 0.18, 0.2), smoothstep(-hs.x, hs.x, local.x)), mix(vec3(0.85, 0.94, 0.92), vec3(0.9, 0.95, 0.97), smoothstep(-hs.x, hs.x, local.x)));
  vec4 c = vec4(air, 1.0) * body * 0.88;
  float bend = sin(world.x * 0.022 - t * 2.2 + seed * 5.0) * 4.0 + (fbm3(vec2(world.x * 0.01 - t * 0.7, world.y * 0.02 + seed)) - 0.5) * 18.0;
  float psi = (world.y + bend) / 9.0;
  float row = floor(psi);
  float gap = abs(fract(psi) - 0.5) * 9.0;
  float speed = 240.0 + 140.0 * hash(vec2(row, 1.0));
  float dash = fract((world.x - t * speed) / (150.0 + 160.0 * hash(vec2(row, 3.0))) + hash(vec2(row, 7.0)));
  float trail = smoothstep(0.0, 0.5, dash) * smoothstep(0.62, 0.5, dash);
  float gust = stroke(gap, 0.45) * trail * step(0.45, hash(vec2(row, seed * 9.0)));
  float field = solid(d - 30.0) * open;
  c = over(c, sky(vec3(0.75, 0.95, 0.9), vec3(0.22, 0.45, 0.4)), gust * field * mix(0.5, 0.85, 1.0 - body));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float flip = max(abs(params.y), 0.18);
  vec2 q = vec2(p.x / flip, p.y);
  float w = 0.42 * (1.0 - q.y * q.y);
  float leaf = smoothstep(0.05, -0.05, abs(q.x) - w) * step(abs(q.y), 0.98);
  float vein = smoothstep(0.06, 0.0, abs(q.x)) * 0.35;
  float stem = smoothstep(0.05, 0.0, abs(q.x)) * step(0.95, -q.y) * step(-q.y, 1.0);
  vec3 green = mix(vec3(0.42, 0.62, 0.22), vec3(0.85, 0.55, 0.16), seed);
  vec3 c = sky(green, green * 0.8) * (mix(0.72, 1.0, step(0.0, params.y)) - vein);
  float a = max(leaf, stem) * alpha;
  return vec4(c * a, a);
}`,
  behavior: drift({ density: 1.2, wind: 260, fall: 10, gust: 260, size: [9, 14], life: [1.2, 2], reach: 30, spin: 5 }),
}
