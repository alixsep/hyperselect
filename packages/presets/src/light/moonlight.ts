import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const moonlight: Preset = {
  name: 'moonlight',
  pad: [16, 12, 10],
  tint: [0.62, 0.74, 0.96],
  selection: { dark: 'color:#f4f8ff;text-shadow:0 1px 3px rgb(4 8 24 / .9)', light: 'color:#0d1830' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (d > 12.0) return vec4(0.0);
  float inside = solid(d);
  float lead = 1.0 - cover;
  float h = clamp((local.y + hs.y) / (2.0 * hs.y), 0.0, 1.0);
  vec2 moon = vec2((hash(vec2(seed, 3.0)) - 0.5) * hs.x * 1.2, -hs.y * 0.15);
  float r = length(local - moon);
  float radius = 6.0;
  float disc = solid(r - radius) * lead * easeOut(age * 1.5);
  float halo = (exp(-max(r - radius, 0.0) / 10.0) * 0.6 + exp(-r / 45.0) * 0.35) * lead;
  float ring = exp(-abs(r - radius * 3.2) / 1.6) * 0.15 * lead;
  float clouds = fbm3(world * vec2(0.012, 0.03) + vec2(t * 0.04, seed * 5.0));
  float part = mix(0.25, 0.62, easeOut(age * 0.6));
  float shade = smoothstep(part, part + 0.14, clouds);
  float silver = (0.7 - h * 0.3) * (1.0 - shade * 0.55);
  float lit = easeOut(age * 2.0);
  if (uLight > 0.5) {
    vec4 c = vec4(mix(vec3(0.66, 0.74, 0.88), vec3(0.5, 0.58, 0.76), shade), 1.0) * inside * (0.4 + 0.25 * (1.0 - h)) * lit;
    c = over(c, vec3(0.86, 0.9, 0.98), clamp(halo * 0.7 + ring, 0.0, 1.0) * lit);
    c = over(c, vec3(0.99, 0.99, 1.0), disc * 0.9);
    c = over(c, vec3(0.45, 0.52, 0.7), stroke(r - radius, 0.6) * lead * easeOut(age * 1.5));
    c = over(c, vec3(0.6, 0.66, 0.8), disc * smoothstep(0.55, 0.75, noise((local - moon) * 0.5 + seed * 9.0)) * 0.5);
    return c * fade;
  }
  vec3 night = mix(vec3(0.05, 0.08, 0.18), vec3(0.03, 0.04, 0.1), shade);
  vec3 rgb = night * inside + vec3(0.42, 0.52, 0.72) * silver * inside * 0.5 + vec3(0.7, 0.8, 1.0) * (halo * 0.5 + ring) + vec3(0.85, 0.9, 1.0) * disc * 0.7;
  return vec4(rgb * lit, inside * 0.7 * lit) * fade;
}`,
}
