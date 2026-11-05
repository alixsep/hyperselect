export const optics = /* glsl */ `
float easeOut(float x) {
  x = 1.0 - clamp(x, 0.0, 1.0);
  return 1.0 - x * x * x;
}

float solid(float d) {
  float aa = max(fwidth(d), 1e-3) * 0.7;
  return smoothstep(aa, -aa, d);
}

float stroke(float d, float w) {
  return solid(abs(d) - w);
}

vec3 spectrum(float x) {
  return clamp(vec3(abs(x * 6.0 - 3.0) - 1.0, 2.0 - abs(x * 6.0 - 2.0), 2.0 - abs(x * 6.0 - 4.0)), 0.0, 1.0);
}
`
