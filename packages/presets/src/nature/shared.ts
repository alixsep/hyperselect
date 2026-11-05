export const growth = /* glsl */ `
float easeOut(float x) {
  x = 1.0 - clamp(x, 0.0, 1.0);
  return 1.0 - x * x * x;
}

float easeBack(float x) {
  x = clamp(x, 0.0, 1.0) - 1.0;
  return 1.0 + 2.70158 * x * x * x + 1.70158 * x * x;
}

vec2 turn(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x + s * p.y, c * p.y - s * p.x);
}
`
