import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const lantern: Preset = {
  name: 'lantern',
  pad: [22, 14, 16],
  tint: [0.95, 0.38, 0.16],
  selection: { dark: 'color:#2a0a00', light: 'color:#2e0b00' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 full = halfSize + vec2(9.0, 1.0);
  float open = easeOut(age * 2.2);
  vec2 hs = vec2(mix(full.y + 6.0, full.x, open), full.y);
  float d = sdRBox(local, hs, hs.y);
  if (d > 20.0) return vec4(0.0);
  float breath = 0.94 + 0.06 * sin(t * 1.2 + seed * 6.0);
  float halo = exp(-max(d, 0.0) / 9.0) * smoothstep(0.0, 0.4, age) * breath;
  float inside = solid(d);
  if (inside <= 0.0) {
    vec3 glow = mix(vec3(1.0, 0.42, 0.12), vec3(0.98, 0.56, 0.3), uLight);
    float a = halo * mix(0.0, 0.32, uLight);
    return vec4(glow * halo * mix(0.42, 0.32, uLight), a) * fade;
  }
  vec2 n = local / hs;
  float curve = n.y * n.y;
  float u = local.x / hs.x;
  float ribSpacing = mix(3.0, 11.0, open);
  float rx = local.x + curve * sign(local.x) * -3.0;
  float rib = 1.0 - smoothstep(0.35, 1.0, abs(fract(rx / ribSpacing) - 0.5) * ribSpacing);
  float caps = smoothstep(hs.x - 8.0, hs.x - 6.5, abs(local.x));
  float core = exp(-dot(n * vec2(1.4, 0.9), n * vec2(1.4, 0.9)) * 1.6);
  float fiber = 0.9 + 0.1 * fbm3(world * vec2(0.08, 0.3) + seed * 7.0);
  float shade = 1.0 - mix(0.35, 0.18, uLight) * curve;
  vec3 paperHot = mix(vec3(1.0, 0.74, 0.36), vec3(1.0, 0.93, 0.8), uLight);
  vec3 paperEdge = mix(vec3(0.88, 0.32, 0.1), vec3(1.0, 0.7, 0.5), uLight);
  vec3 col = mix(paperEdge, paperHot, core * breath) * fiber * shade;
  col = mix(col, col * mix(0.62, 0.84, uLight), rib * (1.0 - caps) * 0.6);
  vec3 lacquer = mix(vec3(0.16, 0.04, 0.02), vec3(0.62, 0.22, 0.12), uLight);
  col = mix(col, lacquer * (1.0 - 0.4 * curve), caps);
  col *= 1.0 - mix(0.25, 0.12, uLight) * smoothstep(-2.5, 0.0, d);
  float a = inside * 0.96;
  return vec4(col * a, a) * fade;
}`,
}
