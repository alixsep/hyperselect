import type { Preset } from 'hyperselect'
import { motion } from './shared'

export const shadow: Preset = {
  name: 'shadow',
  pad: [18, 8, 20],
  tint: [0.45, 0.52, 0.72],
  selection: { dark: 'color:#e8ecf6', light: 'color:#1a1f2c' },
  surface: /* glsl */ `${motion}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float lift = easeOut(age * 2.2) * (1.0 - leaving(age, fade));
  vec2 offset = vec2(1.0, 4.0) * lift;
  float blur = 1.5 + 5.0 * lift;
  float d = sdRBox(local, hs, 3.0);
  float drop = smoothstep(blur, -blur * 0.6, sdRBox(local - offset, hs, 3.0));
  float card = solid(d);
  if (drop <= 0.0 && card <= 0.0) return vec4(0.0);
  float rim = smoothstep(-hs.y, -hs.y + 3.0, local.y);
  vec3 face = mix(vec3(0.15, 0.17, 0.23), vec3(0.99, 0.995, 1.0), uLight);
  face += mix(vec3(0.06, 0.07, 0.1), vec3(0.0), uLight) * (1.0 - rim);
  float edge = stroke(d, 0.5) * mix(0.25, 0.12, uLight);
  vec3 seam = mix(vec3(0.36, 0.42, 0.56), vec3(0.62, 0.66, 0.76), uLight);
  vec4 c = vec4(mix(vec3(0.0), vec3(0.1, 0.12, 0.2), uLight), 1.0) * drop * mix(0.7, 0.2, uLight) * lift;
  c = over(c, face, card * smoothstep(0.0, 0.25, age));
  c = over(c, seam, edge);
  return c * presence(fade);
}`,
}
