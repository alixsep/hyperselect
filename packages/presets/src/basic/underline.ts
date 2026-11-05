import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const underline: Preset = {
  name: 'underline',
  pad: [8, 4, 12],
  tint: [0.38, 0.56, 1.0],
  selection: { dark: 'color:#eef3ff', light: 'color:#0c1d4f' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(2.0, 0.0);
  float baseline = hs.y + 3.0;
  float drawn = easeOut(age * 2.2);
  float head = mix(-hs.x, hs.x, drawn);
  float tail = mix(-hs.x, hs.x, leaving(age, fade));
  float x = clamp(local.x, tail, head);
  float d = length(vec2(local.x - x, local.y - baseline)) - 1.1;
  float stroke = solid(d);
  float wash = solid(sdRBox(local - vec2(0.0, 1.0), hs + vec2(0.0, 1.0), 3.0));
  wash *= smoothstep(head + 2.0, head - 40.0, local.x) * smoothstep(tail - 2.0, tail + 20.0, local.x);
  float spark = exp(-length(local - vec2(head, baseline)) / 4.0) * (1.0 - drawn) * (1.0 - uLight);
  vec3 ink = mix(vec3(0.44, 0.62, 1.0), vec3(0.2, 0.38, 0.92), uLight);
  vec4 c = vec4(ink, 1.0) * wash * mix(0.13, 0.11, uLight);
  c = over(c, ink, stroke);
  c.rgb += vec3(0.7, 0.82, 1.0) * spark;
  return c * presence(fade);
}`,
}
