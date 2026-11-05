import type { Preset } from 'hyperselect'
import { screen } from './shared'

export const terminal: Preset = {
  name: 'terminal',
  pad: [20, 12, 12],
  tint: [0.35, 1, 0.55],
  selection: { dark: 'color:#b8ffc8;text-shadow:0 0 5px rgb(60 255 120 / .5)', light: 'color:#0b3a1a' },
  surface: /* glsl */ `${screen}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (fade < 0.001 || d > 20.0) return vec4(0.0);
  float front = -hs.x + age * 1100.0;
  float typed = step(local.x, front);
  float body = solid(d) * typed;
  vec3 phosphor = sky(vec3(0.3, 1.0, 0.5), vec3(0.1, 0.5, 0.25));
  vec4 c = vec4(sky(vec3(0.015, 0.035, 0.02) + phosphor * 0.02 * scanline(world.y, 3.0), vec3(0.93, 0.96, 0.92) - 0.02 * scanline(world.y, 3.0)), 1.0) * body * 0.97;
  float done = (hs.x * 2.0) / 1100.0;
  float cursorX = min(front, hs.x + 4.0);
  float blink = age < done ? 1.0 : step(0.5, fract((age - done) * 1.6)) * step(age, done + 2.6);
  float cursor = solid(sdBox(local - vec2(cursorX + 3.0, 0.0), vec2(3.0, hs.y - 2.0))) * blink;
  c = over(c, phosphor, cursor * 0.85);
  vec2 chevron = local - vec2(-hs.x - 10.0, 0.0);
  float prompt = stroke(segment(vec2(chevron.x, abs(chevron.y)), vec2(-2.5, 4.0), vec2(2.5, 0.0)), 0.7) * (1.0 - cover);
  c = over(c, phosphor, prompt * smoothstep(0.0, 0.1, age));
  float bloom = exp(-max(d, 0.0) / 5.0) * (1.0 - solid(d)) * typed;
  c += vec4(phosphor * 0.12 * (1.0 - uLight), 0.12 * uLight) * bloom;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
