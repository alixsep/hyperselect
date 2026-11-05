import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const shamrock: Preset = {
  name: 'shamrock',
  pad: [20, 22, 14],
  tint: [0.3, 0.75, 0.4],
  selection: { dark: 'color:#f2fff4;text-shadow:0 1px 2px rgb(0 20 6 / .6)', light: 'color:#0a2412' },
  surface: /* glsl */ `${festive}
float clover(vec2 p, float size) {
  float d = segment(p, vec2(0.0), vec2(size * 0.5, -size * 1.6)) - size * 0.14;
  for (int i = 0; i < 3; i++) {
    vec2 q = rotate(p, -float(i) * 2.0944) / size;
    d = min(d, heart(q + vec2(0.0, -0.55)) * size);
  }
  return d;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.03, 0.16, 0.08), vec3(0.9, 0.97, 0.9)), 1.0) * body * 0.92;
  vec3 gold = sky(vec3(0.95, 0.78, 0.35), vec3(0.72, 0.55, 0.15));
  c = over(c, gold, stroke(d + 1.5, 0.35) * smoothstep(0.0, hs.y, local.y) * body * 0.7);
  vec2 g = world / 6.0 + seed * 11.0;
  vec2 id = floor(g);
  float twinkle = pow(max(sin(t * 2.0 + hash(id + 2.0) * 40.0), 0.0), 8.0) * step(0.92, hash(id));
  c = over(c, gold, clamp(glint(fract(g) * 6.0 - 3.0, 3.0), 0.0, 1.0) * twinkle * body * smoothstep(-8.0, -2.0, d));

  float slot = floor(world.x / 24.0);
  float h = hash(vec2(slot, seed));
  vec2 q = vec2(mod(world.x, 24.0) - 12.0 - (h - 0.5) * 10.0, -(local.y + hs.y + 0.5));
  float grown = smoothstep(0.0, 0.3, age - h * 0.5);
  float size = mix(2.6, 3.4, fract(h * 7.0)) * grown;
  float leaf = solid(clover(rotate(q, (h - 0.5) * 1.2), max(size, 0.01))) * step(0.4, h) * step(abs(local.x), hs.x - 4.0) * grown;
  vec3 green = sky(vec3(0.3, 0.74, 0.38), vec3(0.16, 0.56, 0.26)) * (0.85 + 0.25 * smoothstep(5.0, 0.0, length(q)));
  c = over(c, green, leaf);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
