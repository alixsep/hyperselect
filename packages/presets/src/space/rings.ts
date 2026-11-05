import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const rings: Preset = {
  name: 'rings',
  pad: [22, 12, 12],
  tint: [0.86, 0.72, 0.5],
  selection: { dark: 'color:#1f170a', light: 'color:#2e2312' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float span = halfSize.x + 26.0;
  float u = local.x / span;
  float sag = 7.0 * (1.0 - u * u);
  float u4 = u * u * u * u;
  float thick = (halfSize.y + 3.0) * sqrt(max(1.0 - u4 * u4 * u * u, 0.0));
  float v = (local.y + sag - 3.5) / thick;
  float unfold = easeOut(age * 1.8) * (0.3 + 0.7 * fade);
  float edge = (abs(v) - unfold) * thick;
  float inside = solid(edge);
  if (inside <= 0.0) return vec4(0.0);
  float radius = v * 0.5 + 0.5;
  float aa = fwidth(radius);
  float density = mix(0.34, 0.97, smoothstep(0.12 - aa, 0.12 + aa, radius));
  density = mix(density, 0.06, smoothstep(0.82 - aa, 0.82 + aa, radius));
  density = mix(density, 0.74, smoothstep(0.87 - aa, 0.87 + aa, radius));
  density *= 1.0 - 0.8 * smoothstep(0.006 + aa, 0.006 - aa, abs(radius - 0.95));
  float id = floor(radius * 40.0);
  density *= 0.8 + 0.2 * hash(vec2(id, 3.0));
  float orbit = 1.0 / (0.6 + radius);
  float shimmer = noise(vec2(local.x * 0.03 - t * 6.0 * orbit, radius * 60.0));
  float spoke = smoothstep(0.6, 0.9, noise(vec2(local.x * 0.02 - t * 0.35, seed * 9.0))) * smoothstep(0.15, 0.3, radius) * smoothstep(0.8, 0.6, radius);
  density *= (0.9 + 0.1 * shimmer) * (1.0 - spoke * 0.28) * smoothstep(0.0, 0.05, radius);
  vec3 cream = mix(vec3(0.97, 0.88, 0.7), vec3(0.95, 0.88, 0.74), uLight);
  vec3 tan = mix(vec3(0.8, 0.67, 0.48), vec3(0.85, 0.74, 0.56), uLight);
  vec3 col = mix(tan, cream, smoothstep(0.12, 0.35, radius) * smoothstep(0.82, 0.6, radius) * 0.75 + 0.25 * hash(vec2(id, 7.0)));
  float shade = mix(0.9, 1.0, smoothstep(-1.0, 0.0, v));
  float a = density * 0.94 * inside;
  return vec4(col * shade * a, a) * fade;
}`,
}
