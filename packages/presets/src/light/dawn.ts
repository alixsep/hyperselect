import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const dawn: Preset = {
  name: 'dawn',
  pad: [12, 8, 12],
  tint: [0.96, 0.72, 0.74],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 3px rgb(10 14 40 / .85)', light: 'color:#1c2140' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (d > 10.0) return vec4(0.0);
  float inside = solid(d);
  float h = clamp((local.y + hs.y) / (2.0 * hs.y), 0.0, 1.0);
  float rise = easeOut(age * 0.8);
  vec3 night = mix(vec3(0.07, 0.1, 0.26), vec3(0.7, 0.76, 0.9), uLight);
  vec3 blue = mix(vec3(0.3, 0.38, 0.66), vec3(0.8, 0.82, 0.95), uLight);
  vec3 rose = mix(vec3(0.86, 0.56, 0.66), vec3(0.98, 0.84, 0.86), uLight);
  vec3 peach = mix(vec3(1.0, 0.82, 0.64), vec3(1.0, 0.9, 0.76), uLight);
  float warmth = 1.0 - h;
  vec3 col = mix(night, blue, smoothstep(0.0, 0.6, h + rise * 0.4));
  col = mix(col, rose, smoothstep(0.75, 0.25, warmth / max(rise, 0.05)) * 0.9);
  col = mix(col, peach, smoothstep(0.35, 0.0, warmth / max(rise, 0.05)));
  float mist = smoothstep(0.5, 0.8, fbm3(vec2(world.x * 0.01 - t * 0.03, world.y * 0.12 + seed * 5.0))) * smoothstep(0.3, 0.9, h);
  col = mix(col, mix(vec3(0.95, 0.85, 0.9), vec3(1.0, 0.97, 0.97), uLight), mist * 0.25 * rise);
  float horizon = exp(-abs(local.y - hs.y + 1.0) / 1.3) * rise * smoothstep(hs.x + 2.0, hs.x - 30.0, abs(local.x));
  vec2 cell = floor(world / 9.0), f = fract(world / 9.0) - 0.5;
  float sh = hash(cell + seed);
  vec2 so = (hash2(cell + 2.3) - 0.5) * 0.6;
  float twinkle = 0.6 + 0.4 * sin(t * (1.0 + sh * 2.0) + sh * 30.0);
  float star = smoothstep(0.1, 0.03, length(f - so)) * step(sh, 0.05) * smoothstep(0.55, 0.1, h) * (1.0 - rise) * twinkle;
  col = mix(col, mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.78, 0.48), uLight), clamp(horizon * mix(0.6, 0.8, uLight), 0.0, 1.0));
  col += vec3(0.9, 0.93, 1.0) * star;
  float a = inside * mix(0.84, 0.8, uLight) * smoothstep(0.0, 0.25, age);
  return vec4(min(col, vec3(1.0)) * a, a) * fade;
}`,
}
