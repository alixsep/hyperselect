export const motion = /* glsl */ `
float easeOut(float x) {
  x = 1.0 - clamp(x, 0.0, 1.0);
  return 1.0 - x * x * x;
}

float easeBack(float x) {
  x = clamp(x, 0.0, 1.0) - 1.0;
  return 1.0 + 2.70158 * x * x * x + 1.70158 * x * x;
}

float leaving(float age, float fade) {
  return min((1.0 - fade) * smoothstep(0.25, 0.6, age) * 1.3, 1.0);
}

float presence(float fade) {
  return smoothstep(0.0, 0.5, fade);
}

float solid(float d) {
  float aa = max(fwidth(d), 1e-3) * 0.7;
  return smoothstep(aa, -aa, d);
}

float stroke(float d, float w) {
  return solid(abs(d) - w);
}
`
