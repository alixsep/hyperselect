import type { Preset } from 'hyperselect'

export const salt: Preset = {
  name: 'salt',
  pad: [12, 8, 10],
  tint: [0.86, 0.9, 0.96],
  selection: { dark: 'color:#0d1015', light: 'color:#10141a' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float d = sdRBox(local, hs, 4.0) + (noise(world * 0.3 + seed * 3.0) - 0.5) * 3.0;
  if (d > 4.0) return vec4(0.0);
  float sweep = age - (local.x + hs.x) / 900.0;
  vec2 g = world / 7.0 + seed * 11.0;
  vec2 id = floor(g);
  float h = hash(id);
  float pop = smoothstep(0.0, 0.14, sweep - 0.05 - 0.5 * hash(id + 3.7));
  float ang = h * 6.2832;
  mat2 turn = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 q = turn * (fract(g) - 0.5 - (hash2(id + 1.9) - 0.5) * 0.25) / max(pop, 0.01);
  float extent = 0.2 + 0.12 * hash(id + 5.3);
  float sq = max(abs(q.x), abs(q.y)) - extent;
  float aa = fwidth(sq);
  float grain = smoothstep(aa, -aa, sq) * step(hash(id + 8.1), 0.8) * step(0.01, pop) * smoothstep(1.0, -2.0, d);
  vec2 side = abs(q.x) > abs(q.y) ? vec2(sign(q.x), 0.0) : vec2(0.0, sign(q.y));
  float light = dot(side * turn, normalize(vec2(-0.6, -0.8)));
  float bevel = smoothstep(-extent * 0.45, -extent * 0.15, sq);
  float hopper = smoothstep(0.38, 0.48, abs(fract(sq / extent * 2.5 + 0.2) - 0.5)) * (1.0 - bevel) * 0.2;
  float face = mix(1.0, 0.72 + 0.4 * light, bevel) - hopper;
  float glint = smoothstep(0.92, 1.0, sin(t * (0.6 + h) + h * 40.0)) * step(h, 0.25) * (1.0 - bevel);
  float bed = smoothstep(1.0, -1.0, d) * smoothstep(0.0, 0.3, sweep);
  float powder = 0.85 + 0.3 * noise(world * 1.3);
  vec3 bedC = mix(vec3(0.68, 0.7, 0.74), vec3(0.8, 0.82, 0.85), uLight) * powder;
  vec3 grainC = mix(vec3(0.9, 0.92, 0.95), vec3(0.98, 0.98, 0.99), uLight) * face;
  vec4 c = vec4(bedC, 1.0) * bed * mix(0.94, 0.7, uLight);
  c = over(c, grainC, grain);
  c.rgb += vec3(1.0) * glint * grain * 0.6;
  return c * fade;
}`,
}
