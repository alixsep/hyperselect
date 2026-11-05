import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const sunset: Preset = {
  name: 'sunset',
  pad: [12, 8, 10],
  tint: [0.98, 0.45, 0.28],
  selection: { dark: 'color:#fff6ee;text-shadow:0 1px 3px rgb(40 6 20 / .85)', light: 'color:#2e0b1c' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 3.0);
  if (d > 8.0) return vec4(0.0);
  float inside = solid(d);
  float h = clamp((local.y + hs.y) / (2.0 * hs.y), 0.0, 1.0);
  float glowUp = easeOut(age * 1.2);
  vec3 top = mix(vec3(0.22, 0.09, 0.36), vec3(0.95, 0.68, 0.78), uLight);
  vec3 rose = mix(vec3(0.72, 0.18, 0.4), vec3(1.0, 0.64, 0.58), uLight);
  vec3 ember = mix(vec3(0.95, 0.42, 0.14), vec3(1.0, 0.72, 0.42), uLight);
  vec3 gold = mix(vec3(1.0, 0.68, 0.28), vec3(1.0, 0.85, 0.5), uLight);
  vec3 sky = mix(top, rose, smoothstep(0.0, 0.55, h));
  sky = mix(sky, ember, smoothstep(0.45, 0.85, h) * glowUp);
  sky = mix(sky, gold, smoothstep(0.82, 1.0, h) * glowUp);
  float r = hs.y * 0.85;
  vec2 sun = vec2((hash(vec2(seed, 5.0)) - 0.5) * hs.x * 1.1, mix(-hs.y * 0.4, hs.y - r * 0.35, easeOut(age * 0.8)));
  float sd = length(local - sun) - r;
  float disc = solid(sd) * (1.0 - cover);
  float corona = exp(-max(sd, 0.0) / 16.0) * (1.0 - cover);
  float strata = fbm3(vec2(world.x * 0.008 + t * 0.015 + seed * 3.0, world.y * 0.14));
  float cloud = smoothstep(0.52, 0.66, strata) * smoothstep(0.15, 0.4, h);
  vec3 sunCol = mix(vec3(1.0, 0.86, 0.55), vec3(1.0, 0.95, 0.8), smoothstep(0.0, -r, sd));
  vec3 col = sky + gold * corona * mix(0.35, 0.25, uLight);
  col = mix(col, sunCol, disc);
  vec3 dusk = mix(vec3(0.2, 0.06, 0.2), vec3(0.78, 0.46, 0.6), uLight);
  col = mix(col, dusk + gold * corona * 0.3, cloud * 0.8);
  float a = inside * mix(0.86, 0.82, uLight) * smoothstep(0.0, 0.25, age);
  return vec4(min(col, vec3(1.0)) * a, a) * fade;
}`,
}
