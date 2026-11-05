import type { Preset } from 'hyperselect'

export const tar: Preset = {
  name: 'tar',
  pad: [12, 8, 40],
  tint: [0.42, 0.28, 0.16],
  selection: { dark: 'color:#f6efe4', light: 'color:#fbf6ee' },
  surface: /* glsl */ `
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float ooze(vec2 p, vec2 hs, float shift, float age, float seed) {
  float wx = p.x + shift;
  float level = -hs.y - 4.0 + age * 320.0;
  float body = max(sdRBox(p, hs, 6.0) + (noise(vec2(wx * 0.05, seed * 7.0)) - 0.5) * 2.5, p.y - level - (noise(vec2(wx * 0.08, age)) - 0.5) * 6.0);
  float slot = floor(wx / 26.0);
  float h = hash(vec2(slot, seed * 3.0 + 5.0));
  float cx = (slot + 0.3 + 0.4 * hash(vec2(slot, 2.0))) * 26.0 - shift;
  float grow = clamp((age - 0.5 - 1.5 * hash(vec2(slot, 9.0))) * (6.0 + 8.0 * h), 0.0, 1.0);
  float len = (8.0 + 24.0 * h) * grow * grow * step(h, 0.42) * step(abs(cx), hs.x - 8.0);
  float below = p.y - hs.y;
  float dx = p.x - cx;
  float stem = max(abs(dx) - mix(2.6, 1.0, clamp(below / max(len, 1.0), 0.0, 1.0)), max(-below - 4.0, below - len));
  float bulb = length(vec2(dx, below - len)) - 1.0 - 2.4 * grow;
  return smin(body, min(stem, bulb), 5.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float shift = world.x - local.x;
  float d = ooze(local, hs, shift, age, seed);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(ooze(local - vec2(1.0, 3.0), hs, shift, age, seed), 0.0) / 4.0) * (1.0 - inside) * mix(0.5, 0.2, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  vec2 grad = vec2(ooze(local + vec2(1.0, 0.0), hs, shift, age, seed), ooze(local + vec2(0.0, 1.0), hs, shift, age, seed)) - d;
  vec2 n2 = grad / max(length(grad), 1e-4);
  float e = clamp(-d / 7.0, 0.0, 1.0);
  vec3 n = normalize(vec3(n2 * (1.0 - e * e) * 2.0, 0.3 + e));
  float sway = (noise(vec2(world.x * 0.01 + t * 0.1, seed * 3.0)) - 0.5) * 0.4;
  n = normalize(n + vec3(sway, 0.0, 0.0) * e);
  float spec = smoothstep(0.9, 0.985, dot(n, normalize(vec3(-0.3, -0.6, 0.74))));
  float sheen = smoothstep(0.55, 0.95, dot(n, normalize(vec3(0.4, -0.3, 0.86)))) * (1.0 - e * 0.6);
  float rim = smoothstep(2.0, 0.0, -d) * step(n.y, 0.0);
  vec3 base = mix(vec3(0.085, 0.06, 0.04), vec3(0.15, 0.12, 0.1), uLight);
  vec3 col = base + vec3(0.3, 0.22, 0.14) * sheen * mix(0.7, 0.35, uLight) + vec3(1.0, 0.95, 0.88) * spec * 0.75 + vec3(0.5, 0.42, 0.34) * rim * mix(0.75, 0.4, uLight);
  return vec4(col * inside, inside + sh * (1.0 - inside)) * fade;
}`,
}
