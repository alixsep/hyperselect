export const tone: string = /* glsl */ `
vec3 sky(vec3 dark, vec3 light) {
  return mix(dark, light, uLight);
}

float solid(float d) {
  float aa = max(fwidth(d) * 0.7, 0.02);
  return 1.0 - smoothstep(-aa, aa, d);
}

vec2 rotate(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float glint(vec2 p, float r) {
  return exp(-length(p) / (r * 0.18)) + (exp(-abs(p.y) / (r * 0.06) - abs(p.x) / r) + exp(-abs(p.x) / (r * 0.06) - abs(p.y) / r)) * 0.6;
}

float heart(vec2 p) {
  p = vec2(abs(p.x), p.y + 0.55);
  if (p.y + p.x > 1.0) return sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - 0.3536;
  return sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)), dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

float star(vec2 p, float r, float inner, float points) {
  float sector = 6.2832 / points;
  float k = abs(mod(atan(p.x, p.y), sector) - sector * 0.5) / (sector * 0.5);
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

float drape(float x, float period, float sag) {
  float u = fract(x / period) * 2.0 - 1.0;
  return sag * (1.0 - u * u);
}

vec4 layer(vec4 below, vec4 above) {
  return below * (1.0 - above.a) + above;
}

float flame(vec2 p) {
  p.x = abs(p.x);
  float b = 0.95 / 2.4, a = sqrt(1.0 - b * b);
  float k = dot(p, vec2(-b, a));
  if (k < 0.0) return length(p) - 1.0;
  if (k > a * 2.4) return length(p - vec2(0.0, 2.4)) - 0.05;
  return dot(p, vec2(a, b)) - 1.0;
}

vec4 fire(vec2 p, float size, float t, float seed) {
  float flick = 0.9 + 0.1 * sin(t * 13.0 + seed * 40.0) * sin(t * 7.3 + seed * 11.0);
  vec2 q = p / (size * flick);
  q.x -= sin(q.y * 1.4 - t * 7.0 + seed * 20.0) * 0.12 * max(q.y, 0.0);
  float outer = solid(flame(q) * size);
  float core = solid(flame(q * vec2(1.7, 1.5) + vec2(0.0, 0.5)) * size * 0.6);
  vec2 g = p - vec2(0.0, size * 0.9);
  float halo = exp(-dot(g, g) / (size * size * 6.0)) * flick * 0.5;
  vec3 color = mix(vec3(1.0, 0.52, 0.12), vec3(1.0, 0.95, 0.75), core);
  return layer(vec4(vec3(1.0, 0.62, 0.25) * halo, halo * uLight * 0.35), vec4(color * outer, outer));
}
`
