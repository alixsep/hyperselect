export const slab = /* glsl */ `
float easeOut(float x) {
  x = 1.0 - clamp(x, 0.0, 1.0);
  return 1.0 - x * x * x;
}

float solid(float d) {
  float aa = max(fwidth(d), 1e-3) * 0.75;
  return smoothstep(aa, -aa, d);
}

vec2 outward(vec2 p, vec2 hs, float r) {
  return normalize(p - clamp(p, r - hs, hs - r) + vec2(1e-4, 0.0));
}

float drop(float d, float blur) {
  return exp(-max(d, 0.0) / blur);
}

vec3 bump(float h, float k) {
  return normalize(vec3(-dFdx(h) * k, -dFdy(h) * k, 1.0));
}
`
