export type Color = readonly [r: number, g: number, b: number]

export const vec3 = ([r, g, b]: Color): string => `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`

export const tone: string = /* glsl */ `
vec3 sky(vec3 dark, vec3 light) {
  return mix(dark, light, uLight);
}
`

export const atmosphere: string = /* glsl */ `${tone}
float solid(float d) {
  float aa = max(fwidth(d) * 0.7, 0.55);
  return 1.0 - smoothstep(-aa, aa, d);
}

float stroke(float d, float width) {
  return solid(abs(d) - width);
}

float uncovered(vec2 hs, float cover) {
  return 1.0 - cover * (1.0 - smoothstep(-hs.y - 1.0, -hs.y + 3.0, local.y));
}

float rain(vec2 p, float t, vec2 grid, float speed, float len, float width, float density, float seed) {
  float col = floor(p.x / grid.x);
  float h = hash(vec2(col, seed));
  float y = p.y - t * speed * (0.8 + 0.4 * h) + h * 131.0;
  float row = floor(y / grid.y);
  vec2 r = hash2(vec2(col * 1.7 + seed, row));
  float x = p.x - (col + 0.25 + 0.5 * r.x) * grid.x;
  float v = mod(y, grid.y) - r.y * (grid.y - len);
  float along = clamp(v / len, 0.0, 1.0);
  float on = step(0.0, v) * step(v, len) * step(hash(vec2(row, col + seed * 3.0)), density);
  return on * along * along * max(0.0, 1.0 - abs(x) / (width + 0.7));
}

float flakes(vec2 p, float t, float size, float fall, float blur, float density, float seed) {
  p.y -= t * fall;
  p.x += sin(p.y * 0.04 + seed * 6.0 + t * 0.7) * size * 1.5;
  vec2 grid = vec2(size * 5.0);
  vec2 id = floor(p / grid);
  vec2 c = (id + 0.25 + 0.5 * hash2(id + seed)) * grid;
  float r = size * (0.45 + 0.55 * hash(id + seed + 3.1));
  float d = length(p - c) - r;
  return smoothstep(blur + 0.7, -blur * 0.5 - 0.3, d) * step(hash(id + seed + 9.0), density);
}

float billow(vec2 p, float t) {
  vec2 w = vec2(fbm3(p + vec2(t * 0.06, 0.0)), fbm3(p + vec2(5.2, 1.3) - vec2(t * 0.05, 0.0)));
  return fbm(p + (w - 0.5) * 1.7 + vec2(t * 0.09, 0.0));
}

float glow(vec2 p, float r) {
  return exp(-dot(p, p) / (r * r));
}
`
