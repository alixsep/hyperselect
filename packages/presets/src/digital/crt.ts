import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const crt: Preset = {
  name: 'crt',
  pad: [22, 16, 16],
  tint: [0.4, 0.95, 0.75],
  selection: { dark: 'color:#eafff6;text-shadow:0 0 6px rgb(90 255 190 / .7)', light: 'color:#08261c' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 2.0);
  float warm = smoothstep(0.0, 0.12, age);
  float open = smoothstep(0.1, 0.32, age);
  vec2 shape = vec2(hs.x * warm, mix(1.0, hs.y, open));
  float d = sdRBox(local, max(shape, vec2(0.5)), min(shape.y, 8.0));
  if (fade < 0.001 || d > 16.0) return vec4(0.0);
  float body = solid(d);
  vec2 uv = local / hs;
  float vignette = 1.0 - 0.55 * pow(length(uv * vec2(0.7, 0.9)), 3.0);
  vec3 glass = vec3(0.015, 0.04, 0.035) * vignette;
  float triad = mod(floor(gl_FragCoord.x), 3.0);
  vec3 mask = triad < 1.0 ? vec3(1.0, 0.75, 0.75) : triad < 2.0 ? vec3(0.75, 1.0, 0.75) : vec3(0.75, 0.75, 1.0);
  float scan = 0.65 + 0.35 * scanline(world.y, 3.0);
  float roll = exp(-pow(mod(local.y + hs.y - t * 40.0, hs.y * 2.0 + 80.0) - hs.y - 20.0, 2.0) / 60.0);
  vec3 phosphor = vec3(0.1, 0.32, 0.24) * (0.35 + 0.25 * roll) * vignette;
  vec3 col = sky(glass + phosphor * mask * scan, (vec3(0.86, 0.95, 0.91) - (1.0 - mask) * 0.1 - (1.0 - scan) * 0.08 + roll * 0.03) * mix(1.0, vignette, 0.4));
  float flash = (1.0 - smoothstep(0.05, 0.45, age)) * (1.0 - open * 0.7);
  col += vec3(0.75, 1.0, 0.9) * flash * smoothstep(3.0, 0.0, abs(local.y) - shape.y + 3.0);
  vec4 c = vec4(col, 1.0) * body * 0.97;
  float bloom = exp(-max(d, 0.0) / 6.0) * (1.0 - body) * warm;
  c += vec4(vec3(0.1, 0.45, 0.32) * (1.0 - uLight), uLight * 0.25) * bloom * 0.45;
  c = over(c, sky(vec3(0.1, 0.18, 0.16), vec3(0.45, 0.6, 0.54)), stroke(d + 0.6, 0.6) * body * 0.8);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
