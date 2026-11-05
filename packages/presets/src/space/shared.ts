export const cosmos = /* glsl */ `
float easeOut(float x) {
  x = 1.0 - clamp(x, 0.0, 1.0);
  return 1.0 - x * x * x;
}

float solid(float d) {
  float aa = max(fwidth(d), 1e-3) * 0.7;
  return smoothstep(aa, -aa, d);
}

float window(vec2 hs, float r, float cover) {
  float lift = cover * (r + 2.0);
  return sdRBox(local + vec2(0.0, lift * 0.5), hs + vec2(0.0, lift * 0.5), r);
}

vec3 voidColor() {
  return mix(vec3(0.012, 0.016, 0.04), vec3(0.03, 0.036, 0.075), uLight);
}

float voidAlpha() {
  return mix(0.88, 0.97, uLight);
}

vec4 starCell(vec2 p, float cell, float seed) {
  vec2 id = floor(p / cell);
  vec2 h = hash2(id + seed * 37.0);
  return vec4(p - (id + 0.2 + 0.6 * h) * cell, hash(id + seed * 11.0 + 5.3), hash(id + seed * 23.0 + 9.1));
}

vec3 starHue(float h) {
  return mix(vec3(1.0, 0.82, 0.64), vec3(0.74, 0.84, 1.0), h);
}

float point(vec2 q, float r) {
  return smoothstep(r + 0.7, max(r - 0.5, 0.0), length(q));
}

vec4 sealed(vec3 rgb, float a) {
  return uLight > 0.5 ? vec4(min(rgb, vec3(a)), a) : vec4(rgb, a);
}
`
