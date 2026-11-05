import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const puddles: Preset = {
  name: 'puddles',
  pad: [22, 50, 22],
  tint: [0.42, 0.6, 0.78],
  selection: { dark: 'color:#eef4fa', light: 'color:#152230' },
  surface: /* glsl */ `${atmosphere}
float ripples(vec2 p, float t, float seed) {
  float sum = 0.0;
  for (int k = 0; k < 1; k++) {
    vec2 grid = vec2(34.0, 22.0) * (1.0 + float(k) * 0.37);
    vec2 g = p / grid + float(k) * 7.3;
    vec2 id = floor(g);
    for (int j = 0; j <= 1; j++) for (int i = 0; i <= 1; i++) {
      vec2 cell = id + vec2(float(i), float(j)) - 0.5;
      vec2 h = hash2(cell + seed);
      float phase = fract(t * (0.35 + 0.25 * h.y) + h.x * 9.0);
      vec2 q = (g - cell - 0.5 - (h - 0.5) * 0.6) * grid;
      float r = length(q * vec2(1.0, 2.2)) - phase * 26.0;
      sum += step(0.45, h.y) * sin(r * 0.7) * exp(-r * r * 0.02) * (1.0 - phase) * smoothstep(0.0, 0.08, phase);
    }
  }
  return sum;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 1.5);
  float d = sdRBox(local, hs, min(hs.y, 12.0)) + (fbm3(world * 0.035 + seed * 3.0) - 0.5) * 9.0;
  if (fade < 0.001 || d > 40.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.6, age);
  float pool = solid(d) * open;
  float wave = ripples(world, t, seed);
  float slope = dFdx(wave) + dFdy(wave) * 0.6;
  float reflection = smoothstep(-hs.y, hs.y, local.y + wave * 2.0);
  vec3 water = sky(mix(vec3(0.12, 0.2, 0.32), vec3(0.03, 0.06, 0.1), reflection), mix(vec3(0.66, 0.78, 0.9), vec3(0.8, 0.87, 0.94), reflection));
  vec4 c = vec4(water, 1.0) * pool * 0.92;
  c = over(c, sky(vec3(0.72, 0.85, 0.98), vec3(1.0)), clamp(slope * 1.2, 0.0, 1.0) * pool * 0.55);
  c = over(c, sky(vec3(0.0, 0.02, 0.05), vec3(0.42, 0.55, 0.68)), clamp(-slope * 1.0, 0.0, 1.0) * pool * 0.3);
  float lamp = exp(-length((local - vec2(hs.x * 0.55, wave * 3.0)) * vec2(0.05, 0.25)));
  c = over(c, sky(vec3(1.0, 0.78, 0.45), vec3(1.0, 0.97, 0.9)), lamp * pool * 0.35);
  float shore = stroke(d, 0.6) * open;
  c = over(c, sky(vec3(0.3, 0.42, 0.55), vec3(0.45, 0.56, 0.67)), shore * 0.5);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.65, 0.8, 0.95], [0.25, 0.4, 0.56]),
  behavior: rainfall({ density: 3, speed: 600, slant: 0.03, length: 16, splash: 2 }),
}
