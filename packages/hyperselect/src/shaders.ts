import type { Preset } from './types'

export const NOISE_CELLS = 256

const header = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
uniform float uTime, uFade, uLight;
uniform vec3 uTint;
uniform highp sampler2D uNoise;
out vec4 fragColor;
const float PI = 3.14159265;
const float NOISE_CELLS = ${NOISE_CELLS}.0;

// Integer math keeps lattice values bit-identical across cells; Mali reassociates float math and tears noise into tiles.
vec2 hash2(vec2 p) {
  uvec2 q = uvec2(ivec2(round(p * 1024.0))) * 1664525u + 1013904223u;
  q.x += q.y * 1664525u;
  q.y += q.x * 1664525u;
  q ^= q >> 16u;
  q.x += q.y * 1664525u;
  q.y += q.x * 1664525u;
  q ^= q >> 16u;
  return vec2(q >> 8u) / 16777216.0;
}

float hash(vec2 p) {
  return hash2(p).x;
}

vec2 cellHash(vec2 cell) {
  return texelFetch(uNoise, ivec2(mod(cell, NOISE_CELLS)), 0).rg;
}

float noise(vec2 p) {
  vec2 f = fract(p);
  return texture(uNoise, (mod(floor(p), NOISE_CELLS) + f * f * (3.0 - 2.0 * f) + 0.5) / NOISE_CELLS).r;
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.3); a *= 0.5; }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.07 + vec2(5.2, 1.3); a *= 0.5; }
  return v;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdRBox(vec2 p, vec2 b, float r) {
  return sdBox(p, b - r) - r;
}

vec3 voronoi(vec2 p) {
  vec2 n = floor(p), f = fract(p);
  float f1 = 8.0, f2 = 8.0, id = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 h = cellHash(n + g);
    vec2 r = g + h - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; id = h.x; } else if (d < f2) f2 = d;
  }
  return vec3(sqrt(f1), sqrt(f2), id);
}

vec4 over(vec4 below, vec3 color, float alpha) {
  return vec4(color * alpha, alpha) + below * (1.0 - alpha);
}

// Additive light disappears on a pale page, so there it becomes coverage tinted toward the preset's hue.
vec4 onPage(vec4 color) {
  float m = max(color.r, max(color.g, color.b));
  float excess = m - color.a;
  if (uLight < 0.5 || excess <= 0.0) return color;
  vec3 c = min(color.rgb, vec3(1.0));
  float peak = max(c.r, max(c.g, c.b));
  vec3 hue = c / max(peak, 1e-4);
  float white = min(hue.r, min(hue.g, hue.b));
  hue = mix(hue, uTint, white * 0.8 * smoothstep(0.0, 0.15, excess));
  return vec4(hue * peak, max(color.a, pow(peak, 1.5)));
}

void present(vec4 color) {
  if (color.a < 0.002 && dot(color.rgb, vec3(1.0)) < 0.004) discard;
  fragColor = onPage(color);
}
`

const toClip = /* glsl */ `
uniform vec4 uView;
vec4 toClip(vec2 page) {
  vec2 v = (page - uView.xy) / uView.zw;
  return vec4(v.x * 2.0 - 1.0, 1.0 - v.y * 2.0, 0.0, 1.0);
}
`

const surfaceVertex = /* glsl */ `#version 300 es
layout(location = 0) in vec2 corner;
layout(location = 1) in vec4 rect;
layout(location = 2) in vec4 state;
uniform vec3 uPad;
out vec2 local, halfSize, world;
out vec4 line;
${toClip}
void main() {
  line = state;
  halfSize = rect.zw * 0.5;
  vec2 size = vec2(rect.z + 2.0 * uPad.x, rect.w + uPad.y + uPad.z);
  local = corner * size + vec2(0.0, (uPad.z - uPad.y) * 0.5);
  world = rect.xy + halfSize + local;
  gl_Position = toClip(world);
}
`

const surfaceFragment = (surface: string) => `${header}
uniform vec3 uPad;
in vec2 local, halfSize, world;
in vec4 line;
#line 1
${surface}
void main() {
  vec4 color = surface(uTime, line.x, line.y * uFade, line.z, line.w);
  vec3 feather = min(vec3(40.0), uPad * 0.5);
  float edge = min((halfSize.x + uPad.x - abs(local.x)) / feather.x,
               min((local.y + halfSize.y + uPad.y) / feather.y, (halfSize.y + uPad.z - local.y) / feather.z));
  present(color * smoothstep(0.0, 1.0, edge));
}
`

const spriteVertex = /* glsl */ `#version 300 es
layout(location = 0) in vec2 corner;
layout(location = 1) in vec4 transform;
layout(location = 2) in vec4 vitals;
layout(location = 3) in vec4 extra;
out vec2 point;
out vec4 state, params;
${toClip}
void main() {
  state = vitals;
  params = extra;
  vec2 l = vec2(corner.x, -corner.y);
  point = l * 2.0;
  float c = cos(transform.w), s = sin(transform.w);
  vec2 r = vec2(c * l.x - s * l.y, s * l.x + c * l.y) * transform.z;
  gl_Position = toClip(transform.xy + vec2(r.x, -r.y));
}
`

const spriteFragment = (sprite: string) => `${header}
in vec2 point;
in vec4 state, params;
#line 1
${sprite}
void main() {
  present(sprite(point, state.x, state.y * uFade, state.z, state.w, uTime));
}
`

export const surfaceShaders = (preset: Preset): [string, string] => [surfaceVertex, surfaceFragment(preset.surface)]

export const spriteShaders = (preset: Preset): [string, string] | undefined =>
  preset.sprite ? [spriteVertex, spriteFragment(preset.sprite)] : undefined
