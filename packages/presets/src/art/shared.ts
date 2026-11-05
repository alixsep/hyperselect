export const tone: string = /* glsl */ `
vec3 sky(vec3 dark, vec3 light) {
  return mix(dark, light, uLight);
}

float solid(float d) {
  float aa = max(fwidth(d) * 0.7, 0.02);
  return 1.0 - smoothstep(-aa, aa, d);
}
`

export const studio: string = /* glsl */ `${tone}
float stroke(float d, float width) {
  return solid(abs(d) - width);
}

float uncovered(vec2 hs, float cover) {
  return 1.0 - cover * (1.0 - smoothstep(-hs.y - 1.0, -hs.y + 3.0, local.y));
}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 q = p - a, v = b - a;
  return length(q - v * clamp(dot(q, v) / dot(v, v), 0.0, 1.0));
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float tooth(vec2 p) {
  return noise(p * 1.3) * 0.65 + noise(p * 2.7 + 7.0) * 0.35;
}

float sweep(float x, vec2 hs, float age, float speed, float soft) {
  return smoothstep(0.0, soft, age * speed - x - hs.x);
}
`
