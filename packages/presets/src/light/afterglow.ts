import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const afterglow: Preset = {
  name: 'afterglow',
  pad: [14, 10, 12],
  tint: [0.96, 0.5, 0.42],
  selection: { dark: 'color:#fff4ec;text-shadow:0 1px 3px rgb(30 6 30 / .8)', light: 'color:#2a0a24' },
  surface: /* glsl */ `${optics}
vec3 cooling(float heat) {
  vec3 c = mix(vec3(0.3, 0.12, 0.55), vec3(0.85, 0.26, 0.45), smoothstep(0.05, 0.35, heat));
  c = mix(c, vec3(1.0, 0.6, 0.25), smoothstep(0.3, 0.65, heat));
  return mix(c, vec3(1.0, 0.96, 0.88), smoothstep(0.65, 1.0, heat));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 0.0);
  float d = sdRBox(local, hs, hs.y);
  if (d > 10.0) return vec4(0.0);
  float haze = smoothstep(8.0, -4.0, d);
  float x = local.x + hs.x + 30.0;
  float since = age - x / 900.0;
  float head = exp(-max(since, 0.0) * 1.1) * smoothstep(-0.12, 0.05, since);
  float relight = exp(-fract(t * 0.25 - world.x * 0.00025 - seed * 0.3) * 5.0) * 0.4 * smoothstep(1.5, 3.0, age);
  float grain = noise(world * vec2(0.04, 0.12) + vec2(t * 0.3, 0.0));
  float heat = clamp(0.16 + head * 0.75 + relight + (grain - 0.5) * 0.12, 0.0, 1.0) * mix(0.55, 1.0, fade);
  float lit = smoothstep(-0.12, 0.05, since);
  vec3 col = cooling(heat);
  float glow = haze * lit * (0.5 + heat * 0.4);
  if (uLight > 0.5) {
    vec3 ink = mix(col * vec3(0.95, 0.85, 0.95), vec3(1.0, 0.82, 0.62), smoothstep(0.7, 1.0, heat));
    float a = glow * 0.62;
    return vec4(ink * a, a) * fade;
  }
  return vec4(col * glow * 0.8, glow * 0.5) * fade;
}`,
}
