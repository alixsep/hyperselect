import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const datamosh: Preset = {
  name: 'datamosh',
  pad: [18, 12, 12],
  tint: [0.85, 0.4, 0.75],
  selection: { dark: 'color:#fff;text-shadow:0 1px 2px rgb(0 0 0 / .8)', light: 'color:#1a0a1e;text-shadow:0 0 4px rgb(255 255 255 / .9)' },
  surface: /* glsl */ `${screen}
vec3 frame(vec2 p, float t, float seed) {
  float a = fbm3(p * 0.012 + vec2(seed * 3.0, t * 0.05));
  float b = fbm3(p * 0.02 - vec2(t * 0.04, seed));
  vec3 dark = mix(mix(vec3(0.36, 0.08, 0.32), vec3(0.05, 0.27, 0.3), a), vec3(0.42, 0.2, 0.06), smoothstep(0.55, 0.75, b));
  vec3 light = mix(mix(vec3(1.0, 0.76, 0.9), vec3(0.72, 0.94, 0.92), a), vec3(1.0, 0.88, 0.7), smoothstep(0.55, 0.75, b));
  return sky(dark, light);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  vec2 block = floor(world / 8.0);
  float gop = floor(t / 2.6 + seed);
  float since = fract(t / 2.6 + seed) * 2.6;
  float step8 = floor(since * 8.0) / 8.0;
  vec2 motion = (hash2(block + gop * 1.7) - 0.5) * vec2(28.0, 6.0) * step(0.45, hash(block + gop));
  float moshed = step(0.35, since);
  vec2 jag = (hash2(floor(local / 4.0) + gop) - 0.5) * 4.0 * moshed;
  float d = sdBox(local + jag, hs);
  if (fade < 0.001 || d > 12.0) return vec4(0.0);
  float body = step(d, 0.0) * smoothstep(0.0, 0.12, age);
  vec2 src = world - motion * step8 * moshed;
  float streak = step(0.82, hash(block + gop + 11.0)) * moshed;
  src.x = mix(src.x, (block.x + 0.5) * 8.0 - motion.x * 0.3, streak);
  vec3 col = frame(src, t, seed);
  vec3 chroma = frame(src + vec2(3.0, 0.0), t, seed);
  col = vec3(col.r, mix(col.g, chroma.g, 0.6 * moshed), chroma.b);
  float residue = step(0.93, hash(block + floor(t * 6.0))) * moshed;
  col = mix(col, sky(vec3(0.05, 0.35, 0.18), vec3(0.6, 1.0, 0.7)), residue * 0.6);
  float edgeBlocks = step(mod(world.x, 8.0), 0.6) + step(mod(world.y, 8.0), 0.6);
  col *= 1.0 - min(edgeBlocks, 1.0) * 0.12 * moshed;
  vec4 c = vec4(col, 1.0) * body * 0.94;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
