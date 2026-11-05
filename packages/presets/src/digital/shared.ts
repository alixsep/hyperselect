export const tone: string = /* glsl */ `
vec3 sky(vec3 dark, vec3 light) {
  return mix(dark, light, uLight);
}

float solid(float d) {
  float aa = max(fwidth(d) * 0.7, 0.02);
  return 1.0 - smoothstep(-aa, aa, d);
}

float bitmap(vec2 p, uint bits, float scale) {
  ivec2 bit = ivec2(floor(p / scale));
  if (bit.x < 0 || bit.x > 2 || bit.y < 0 || bit.y > 4) return 0.0;
  vec2 cell = abs(mod(p, scale) - scale * 0.5);
  return float((bits >> uint(bit.y * 3 + bit.x)) & 1u) * step(max(cell.x, cell.y), scale * 0.42);
}

float digit(vec2 p, int n, float scale) {
  const uint digits[10] = uint[10](31599u, 29850u, 29671u, 31207u, 18925u, 31183u, 31695u, 18727u, 31727u, 31215u);
  return bitmap(p, digits[clamp(n, 0, 9)], scale);
}

float bayer(vec2 p) {
  const float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  ivec2 i = ivec2(mod(floor(p), 4.0));
  return (m[i.y * 4 + i.x] + 0.5) / 16.0;
}
`

export const screen: string = /* glsl */ `${tone}
float stroke(float d, float width) {
  return solid(abs(d) - width);
}

float uncovered(vec2 hs, float cover) {
  return 1.0 - cover * (1.0 - smoothstep(-hs.y - 1.0, -hs.y + 3.0, local.y));
}

float lattice(vec2 p) {
  vec2 g = abs(fract(p - 0.5) - 0.5) / max(fwidth(p), vec2(1e-4));
  return 1.0 - min(min(g.x, g.y), 1.0);
}

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 q = p - a, v = b - a;
  return length(q - v * clamp(dot(q, v) / dot(v, v), 0.0, 1.0));
}

float scanline(float y, float period) {
  return 0.5 + 0.5 * cos(y / period * 6.2832);
}
`
