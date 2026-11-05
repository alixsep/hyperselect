import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const doodles: Preset = {
  name: 'doodles',
  pad: [30, 34, 22],
  tint: [0.35, 0.5, 0.95],
  selection: { dark: 'color:#f6f7ff', light: 'color:#141a3a' },
  surface: /* glsl */ `${festive}
float scribble(vec2 p, float frame, float k) {
  return (noise(p * 0.09 + frame * 3.7 + k) - 0.5) * 2.2;
}

float spiral(vec2 p, float turns) {
  float r = length(p);
  float a = atan(p.y, p.x) / 6.2832;
  float arm = fract(r / 2.4 - a);
  return (min(arm, 1.0 - arm) * 2.4 - 0.4) + max(r - turns * 2.4, 0.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float frame = floor(t * 8.0);
  float wobble = scribble(world, frame, seed);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  vec4 c = vec4(sky(vec3(0.07, 0.09, 0.17), vec3(0.99, 0.98, 0.94)), 1.0) * body * 0.92;
  float rule = stroke(mod(world.y, 12.0) - 6.0, 0.35);
  c = over(c, sky(vec3(0.16, 0.2, 0.34), vec3(0.72, 0.84, 0.95)), rule * body * 0.6);
  vec3 ink = sky(vec3(0.98, 0.94, 0.82), vec3(0.16, 0.26, 0.75));
  vec3 marker = sky(vec3(1.0, 0.5, 0.6), vec3(0.95, 0.3, 0.42));
  vec3 lime = sky(vec3(0.75, 1.0, 0.45), vec3(0.98, 0.78, 0.15));
  float around = atan(local.y * hs.x / max(hs.y, 1.0), local.x) / 6.2832 + 0.5;
  float drawn = step(fract(around + seed), smoothstep(0.0, 0.7, age) * 1.02);
  float outline = stroke(d - 3.0 + wobble, 0.75) * drawn;
  float second = stroke(d - 4.5 + scribble(world, frame, seed + 9.0), 0.45) * drawn * 0.6;
  c = over(c, ink, max(outline, second) * 0.9);
  float u = local.x + hs.x;
  float underline = local.y - hs.y + 2.5 - abs(mod(u, 7.0) - 3.5) * 0.9 + scribble(world, frame, seed + 3.0) * 0.6;
  float written = step(u, smoothstep(0.15, 0.8, age) * hs.x * 2.0);
  c = over(c, marker, stroke(underline, 0.7) * written * step(abs(local.x), hs.x - 4.0) * body);
  vec2 corner = local - vec2(hs.x + 9.0, -hs.y - 8.0) + vec2(wobble, -wobble) * 0.6;
  float pop = smoothstep(0.5, 0.75, age);
  float starMark = stroke(star(corner / 9.0, 1.0, 0.45, 5.0) * 9.0, 0.7) * pop;
  vec2 swirl = local - vec2(-hs.x - 9.0, hs.y + 6.0) + vec2(-wobble, wobble) * 0.5;
  float coil = solid(spiral(swirl, 2.2 * smoothstep(0.6, 1.0, age))) * step(length(swirl), 6.0);
  c = over(c, lime, starMark);
  c = over(c, marker, coil);
  float hatch = stroke(mod(local.x + local.y + wobble * 0.4, 5.0) - 2.5, 0.35) * step(0.0, d - 6.0) * step(d - 6.0, 4.0) * step(local.x, -hs.x * 0.4) * step(local.y, 0.0) * pop;
  c = over(c, ink, hatch * 0.35);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
