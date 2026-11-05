import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const prism: Preset = {
  name: 'prism',
  pad: [16, 10, 12],
  tint: [0.6, 0.66, 1.0],
  selection: { dark: 'color:#f6f8ff;text-shadow:0 1px 2px rgb(5 8 25 / .7)', light: 'color:#141a3a' },
  surface: /* glsl */ `${optics}
float uncovered(vec2 hs, float cover) {
  return 1.0 - cover * (1.0 - smoothstep(-hs.y - 1.0, -hs.y + 3.0, local.y));
}

vec3 dispersion(float x) {
  vec3 w = (vec3(x) - vec3(0.8, 0.52, 0.25)) / vec3(0.22, 0.2, 0.2);
  return exp(-w * w) + vec3(0.3, 0.0, 0.3) * exp(-pow((x - 0.06) / 0.1, 2.0));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 5.0);
  if (fade < 0.001 || d > 10.0) return vec4(0.0);
  float inside = solid(d);
  float reveal = easeOut(age * 2.2);
  vec2 q = abs(local) - hs + 5.0;
  vec2 n = sign(local) * (min(q.x, q.y) > 0.0 ? normalize(q) : q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  float lit = dot(n, normalize(vec2(-0.45, -1.0)));
  float bevel = smoothstep(-5.0, 0.0, d) * inside;
  float depth = clamp(-d / 5.0, 0.0, 1.0);

  vec4 c = vec4(0.0);
  c = over(c, vec3(0.1, 0.12, 0.25), smoothstep(5.0, 0.0, sdRBox(local - vec2(0.0, 2.0), hs, 5.0)) * (1.0 - inside) * uLight * 0.1);
  c = over(c, mix(vec3(0.5, 0.56, 0.8), vec3(0.88, 0.9, 0.98), uLight), inside * mix(0.1, 0.55, uLight));
  c = over(c, vec3(1.0), bevel * max(lit, 0.0) * mix(0.16, 0.5, uLight));
  c = over(c, mix(vec3(0.02, 0.03, 0.08), vec3(0.45, 0.5, 0.7), uLight), bevel * max(-lit, 0.0) * mix(0.3, 0.2, uLight));

  vec2 cut = vec2(dot(world, normalize(vec2(0.5, 1.0))), dot(world, normalize(vec2(0.85, -1.0)))) / 46.0 + seed;
  cut += 0.3 * sin(cut * vec2(0.7, 0.55) + seed * 9.0);
  vec2 facet = floor(cut);
  vec2 inset = (0.5 - abs(fract(cut) - 0.5)) * 46.0;
  float seam = min(inset.x, inset.y);
  vec3 normal = normalize(vec3((hash2(facet) - 0.5) * 0.7, 1.0));
  float spin = t * 0.35 + seed * 6.0;
  vec3 sun = normalize(vec3(cos(spin) * 0.6, sin(spin) * 0.4, 1.0));
  float shade = clamp((dot(normal, sun) - 0.93) * 4.0, -1.0, 1.0) * inside * reveal;
  c = over(c, shade > 0.0 ? vec3(1.0) : mix(vec3(0.02, 0.03, 0.1), vec3(0.4, 0.45, 0.68), uLight), abs(shade) * mix(0.14, 0.12, uLight));
  float fire = pow(max(reflect(-sun, normal).z, 0.0), 60.0) * smoothstep(0.0, 12.0, seam) * inside * reveal;
  vec3 hue = dispersion(hash(facet + 5.0));
  c.rgb += hue * fire * (1.0 - uLight) * 0.4;
  c = over(c, mix(hue, vec3(1.0), 0.3), fire * uLight * 0.45);
  float edge = smoothstep(0.9, 0.0, seam) * inside * reveal;
  c = over(c, mix(vec3(0.85, 0.9, 1.0), vec3(0.36, 0.4, 0.62), uLight), edge * mix(0.12, 0.16, uLight));

  vec2 split = vec2(0.9, 0.6);
  vec3 rgb = vec3(stroke(sdRBox(local - split, hs, 5.0) + 0.6, 0.35), stroke(d + 0.6, 0.35), stroke(sdRBox(local + split, hs, 5.0) + 0.6, 0.35));
  float coverage = max(max(rgb.r, rgb.g), rgb.b);
  float white = min(min(rgb.r, rgb.g), rgb.b) / max(coverage, 1e-3);
  c.rgb += rgb * (1.0 - uLight) * 0.6;
  c = over(c, mix(rgb / max(coverage, 1e-3), vec3(0.32, 0.36, 0.58), white), coverage * uLight * 0.7);
  c = over(c, vec3(1.0), stroke(d + 0.6, 0.35) * smoothstep(0.3, 0.9, lit) * mix(0.4, 0.8, uLight));

  vec2 g = local - vec2(-hs.x + 7.0, -hs.y + 0.5);
  float star = exp(-length(g) / 1.2) + (exp(-abs(g.y) * 2.0 - abs(g.x) / 6.0) + exp(-abs(g.x) * 2.0 - abs(g.y) / 6.0)) * 0.5;
  c = over(c, vec3(1.0), clamp(star * pow(max(sin(t * 0.8 + seed * 6.28), 0.0), 12.0) * reveal, 0.0, 1.0) * 0.9);

  return c * uncovered(hs, cover) * smoothstep(0.0, 0.15, age) * smoothstep(0.0, 0.7, fade);
}`,
}
