import type { Preset } from 'hyperselect'

export const sand: Preset = {
  name: 'sand',
  pad: [16, 10, 16],
  tint: [0.86, 0.68, 0.4],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(40 24 6 / .9)', light: 'color:#3a2810' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float drift = fbm3(world * 0.03 + seed * 7.0);
  float grain = hash(floor(world * 1.2) + seed);
  float d = sdRBox(local, hs, 7.0) + (drift - 0.5) * 7.0;
  float front = age * 800.0 - (local.x + hs.x) + (drift - 0.5) * 50.0;
  float poured = smoothstep(-6.0, 6.0, front + (grain - 0.5) * 14.0);
  float sh = exp(-max(d - 2.0, 0.0) / 5.0) * smoothstep(-4.0, 6.0, local.y) * mix(0.4, 0.12, uLight);
  float inside = smoothstep(0.6, -0.6, d + (grain - 0.5) * 4.0 * smoothstep(-5.0, 0.0, d));
  float scatter = step(0.93, grain) * smoothstep(6.0, 0.0, d) * (1.0 - inside);
  float body = max(inside, scatter) * poured;
  if (body + sh <= 0.0) return vec4(0.0);
  float swirl = fbm3(world * vec2(0.01, 0.02) + seed * 3.0);
  float phase = world.x * 0.27 + sin(world.y * 0.035 + swirl * 4.0) * 1.1 + (swirl - 0.5) * 9.0 - t * 0.12;
  float f = fract(phase / 6.283);
  float lee = smoothstep(0.62, 0.72, f) * (1.0 - smoothstep(0.92, 1.0, f));
  float crest = smoothstep(0.5, 0.64, f) * (1.0 - smoothstep(0.64, 0.7, f));
  vec3 dune = mix(vec3(0.47, 0.35, 0.2), vec3(0.93, 0.84, 0.66), uLight);
  vec3 col = dune * (0.88 + 0.2 * drift);
  col *= 1.0 - mix(0.16, 0.08, uLight) * lee;
  col += mix(vec3(0.08, 0.06, 0.03), vec3(0.04, 0.03, 0.02), uLight) * crest;
  col *= 0.94 + 0.12 * grain;
  col = mix(col, mix(vec3(0.26, 0.18, 0.1), vec3(0.7, 0.58, 0.42), uLight), step(0.95, grain) * 0.7);
  col = mix(col, mix(vec3(0.62, 0.32, 0.18), vec3(0.9, 0.66, 0.5), uLight), step(0.9, hash(floor(world * 1.2) + 3.7)) * 0.3);
  float glint = step(0.992, hash(floor(world * 0.9) + 1.3)) * (0.5 + 0.5 * sin(t * 2.0 + grain * 40.0));
  col += vec3(1.0, 0.95, 0.8) * glint * mix(0.6, 0.3, uLight);
  col *= 1.0 - 0.2 * smoothstep(-3.0, 0.0, d);
  float blown = step(grain * 0.7 + (local.x + hs.x) / (2.0 * hs.x) * 0.3, fade * 1.05);
  body *= mix(blown, 1.0, fade * fade);
  vec4 c = vec4(col * body, body) + vec4(vec3(0.05, 0.03, 0.01) * sh, sh) * (1.0 - body) * poured;
  return c * sqrt(fade);
}`,
}
