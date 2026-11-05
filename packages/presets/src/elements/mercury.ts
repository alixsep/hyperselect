import type { Preset } from 'hyperselect'

export const mercury: Preset = {
  name: 'mercury',
  pad: [16, 12, 14],
  tint: [0.72, 0.78, 0.86],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#0c0f14' },
  surface: /* glsl */ `
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float pool(vec2 p, vec2 hs, float front, float shift, float t, float seed) {
  float wx = p.x + shift;
  float ripple = (noise(vec2(wx * 0.035, t * 0.7 + seed * 9.0)) - 0.5) * 2.4 * sign(p.y);
  float body = sdRBox(p, hs, min(hs.y, 10.0)) + ripple;
  body = max(body, p.x - front + p.y * p.y / (2.0 * hs.y + 6.0));
  float slot = floor(wx / 36.0);
  float h = hash(vec2(slot, seed * 5.0 + 1.0));
  float cx = (slot + 0.5) * 36.0 + (hash(vec2(slot, 3.0)) - 0.5) * 16.0 - shift;
  float side = h < 0.25 ? -1.0 : 1.0;
  float bead = length(vec2(p.x - cx, p.y - side * (hs.y + 3.5))) - (2.2 + 2.2 * hash(vec2(slot, 7.0)));
  bead = mix(1e3, bead, step(h, 0.5) * step(cx + 10.0, front) * step(abs(cx), hs.x - 6.0));
  return smin(body, bead, 4.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float front = -hs.x - 20.0 + age * 700.0;
  float shift = world.x - local.x;
  float d = pool(local, hs, front, shift, t, seed);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(pool(local - vec2(1.5, 3.0), hs, front, shift, t, seed), 0.0) / 4.0) * (1.0 - inside) * mix(0.6, 0.18, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  vec2 grad = vec2(pool(local + vec2(1.0, 0.0), hs, front, shift, t, seed), pool(local + vec2(0.0, 1.0), hs, front, shift, t, seed)) - d;
  vec2 n2 = grad / max(length(grad), 1e-4);
  float e = clamp(-d / min(hs.y, 9.0), 0.0, 1.0);
  float slope = 1.0 - e * e;
  vec3 n = normalize(vec3(n2 * slope * 1.8, 0.35 + e));
  float band = local.y / hs.y + n.y * 0.8 + (noise(vec2(world.x * 0.012 + t * 0.15, seed)) - 0.5) * 0.25;
  float sky = smoothstep(0.35, -0.75, band);
  float horizon = exp(-abs(band - 0.25) * 5.0);
  float floorLight = smoothstep(0.55, 1.2, band);
  vec3 dim = mix(vec3(0.16, 0.18, 0.21), vec3(0.6, 0.63, 0.68), uLight);
  vec3 lit = mix(vec3(0.62, 0.66, 0.72), vec3(0.94, 0.96, 0.98), uLight);
  vec3 col = mix(dim, lit, sky);
  col *= 1.0 - mix(0.55, 0.25, uLight) * horizon;
  col += vec3(0.3, 0.32, 0.36) * floorLight * mix(0.7, 0.9, uLight);
  float spec = smoothstep(0.93, 0.99, dot(n, normalize(vec3(-0.35, -0.55, 0.75))));
  col += vec3(1.0) * spec * 0.9;
  col *= 1.0 - 0.35 * smoothstep(0.6, 0.0, e) * step(0.0, n.y);
  return vec4(col * inside, inside + sh * (1.0 - inside)) * fade;
}`,
}
