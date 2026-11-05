export const tone: string = /* glsl */ `
vec3 sky(vec3 dark, vec3 light) {
  return mix(dark, light, uLight);
}

vec3 candy(float h) {
  vec3 c = h < 0.2 ? vec3(1.0, 0.36, 0.5) : h < 0.4 ? vec3(1.0, 0.72, 0.2) : h < 0.6 ? vec3(0.3, 0.82, 0.62) : h < 0.8 ? vec3(0.32, 0.6, 1.0) : vec3(0.7, 0.45, 1.0);
  return c * mix(1.0, 0.92, uLight);
}

vec3 rainbow(float h) {
  return clamp(0.5 + 0.5 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67))), 0.0, 1.0);
}

float solid(float d) {
  float aa = max(fwidth(d) * 0.7, 0.02);
  return 1.0 - smoothstep(-aa, aa, d);
}

float heart(vec2 p) {
  p = vec2(abs(p.x), p.y + 0.55);
  if (p.y + p.x > 1.0) return sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - 0.3536;
  return sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)), dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

float star(vec2 p, float r, float inner, float points) {
  float a = atan(p.x, p.y);
  float sector = 6.2832 / points;
  float k = abs(mod(a, sector) - sector * 0.5) / (sector * 0.5);
  return length(p) - r * mix(inner, 1.0, pow(k, 1.6));
}
`

export const festive: string = /* glsl */ `${tone}
float stroke(float d, float width) {
  return solid(abs(d) - width);
}

float uncovered(vec2 hs, float cover) {
  return 1.0 - cover * (1.0 - smoothstep(-hs.y - 1.0, -hs.y + 3.0, local.y));
}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 q = p - a, v = b - a;
  return length(q - v * clamp(dot(q, v) / max(dot(v, v), 0.001), 0.0, 1.0));
}

mat2 turn(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}
`
