import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const radar: Preset = {
  name: 'radar',
  pad: [18, 14, 14],
  tint: [0.35, 0.95, 0.55],
  selection: { dark: 'color:#eafff0;text-shadow:0 0 6px rgb(80 255 140 / .55)', light: 'color:#06280f' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float d = sdRBox(local, hs, min(hs.y, 10.0));
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float span = max(hs.y * 4.0, 90.0);
  float slot = floor((local.x + hs.x) / span);
  vec2 center = vec2(-hs.x + (slot + 0.5) * span, 0.0);
  vec2 q = local - center;
  float sweep = t * 2.0 + seed * 6.2832 + slot * 1.7;
  float angle = atan(q.y, q.x);
  float behind = mod(sweep - angle, 6.2832);
  float afterglow = exp(-behind * 1.6);
  float beam = exp(-behind * 30.0);
  float r = length(q);
  vec3 phosphor = sky(vec3(0.25, 1.0, 0.5), vec3(0.05, 0.5, 0.25));
  vec4 c = vec4(sky(vec3(0.01, 0.06, 0.03) + phosphor * afterglow * 0.07, vec3(0.88, 0.95, 0.9) - afterglow * vec3(0.08, 0.03, 0.06)), 1.0) * body * 0.96;
  float rings = stroke(mod(r + 7.0, 14.0) - 7.0, 0.35) * 0.18 + (stroke(q.x, 0.3) + stroke(q.y, 0.3)) * 0.12;
  c = over(c, phosphor, rings * body);
  c = over(c, phosphor, beam * body * 0.55);
  vec2 g = floor(world / 18.0);
  vec2 spot = (g + 0.2 + hash2(g + seed) * 0.6) * 18.0;
  vec2 bq = spot - world + local - center;
  float blipBehind = mod(sweep - atan(bq.y, bq.x), 6.2832);
  float blip = exp(-length(world - spot) * 0.9) * step(0.7, hash(g + 2.0)) * exp(-blipBehind * 0.9);
  c = over(c, sky(vec3(0.7, 1.0, 0.8), vec3(0.0, 0.4, 0.15)), clamp(blip * 3.0, 0.0, 1.0) * body);
  c = over(c, phosphor * 0.5, stroke(d + 0.6, 0.5) * body * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
