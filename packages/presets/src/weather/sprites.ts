import { type Color, tone, vec3 } from './shared'

/* @__NO_SIDE_EFFECTS__ */
export const snowflakes = (dark: Color, light: Color): string => /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec3 tint = sky(${vec3(dark)}, ${vec3(light)});
  float cover = mix(0.45, 0.9, uLight);
  if (params.x > 1.05) {
    vec2 q = vec2(p.x * params.x, p.y);
    float a = exp(-dot(q, q) * 2.5) * alpha * 0.8;
    return vec4(tint * a, a * cover);
  }
  if (kind < 0.5) {
    float r = length(p);
    float angle = atan(p.y, p.x);
    float sector = abs(mod(angle + 0.5236, 1.0472) - 0.5236);
    vec2 q = vec2(cos(sector), sin(sector)) * r;
    float arm = smoothstep(0.09, 0.02, abs(q.y)) * smoothstep(0.95, 0.8, r);
    vec2 b = vec2(q.x - 0.55, abs(q.y));
    float barb = smoothstep(0.07, 0.015, abs(b.y - b.x * 0.75)) * step(0.0, b.x) * smoothstep(0.3, 0.2, b.x);
    float hub = smoothstep(0.2, 0.1, r);
    float a = clamp(arm + barb + hub, 0.0, 1.0) * alpha;
    float halo = exp(-r * r * 3.0) * 0.18 * alpha;
    return vec4(tint * (a + halo), (a + halo * 0.5) * cover);
  }
  float r = length(p);
  float a = smoothstep(1.0, 0.15 + 0.4 * seed, r) * alpha * (0.55 + 0.45 * seed);
  return vec4(tint * a, a * cover);
}`

/* @__NO_SIDE_EFFECTS__ */
export const motes = (dark: Color, light: Color): string => /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec3 tint = sky(${vec3(dark)}, ${vec3(light)});
  vec2 q = vec2(p.x * params.x, p.y);
  float r2 = dot(q, q);
  float twinkle = 0.65 + 0.35 * params.y;
  float core = exp(-r2 * 9.0), halo = exp(-r2 * 2.5) * 0.3;
  float a = (core + halo) * alpha * twinkle * (0.5 + 0.5 * seed);
  return vec4(tint * a * 1.2, a * mix(0.15, 0.8, uLight));
}`
