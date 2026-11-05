import type { Preset } from 'hyperselect'

export const paper: Preset = {
  name: 'paper',
  pad: [60, 55, 65],
  tint: [0.62, 0.52, 0.36],
  selection: { dark: 'color:#1e1a15', light: 'color:#1e1a15' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float ang = (hash(vec2(seed, 7.0)) - 0.5) * 0.01;
  vec2 l = vec2(local.x, local.y + local.x * ang);
  vec2 hs = halfSize + vec2(8.0, 4.0);
  float pw = 64.0 + 34.0 * hash(vec2(seed, 1.0));
  float gx = l.x + hs.x;
  float nk = max(floor(2.0 * hs.x / pw), 1.0);
  float k = clamp(floor(gx / pw), 0.0, nk);
  float o = clamp(age * 14.0 - k * 0.08, 0.0, 1.0);
  float open = 1.0 - pow(1.0 - o, 3.0) + sin(o * PI) * 0.06;
  open *= clamp(fade * 4.0 - (1.0 - k / nk) * 2.0, 0.0, 1.0);
  open = clamp(open, 0.0, 1.06);
  if (open < 0.002) return vec4(0.0);
  float ly = (l.y + hs.y) / open - hs.y;
  vec2 w = vec2(world.x, world.y - local.y + ly);
  float tearT = (fbm(vec2(w.x * 0.07, seed * 13.0)) - 0.5) * 5.0 + (noise(vec2(w.x * 0.55, seed)) * 2.0 - 1.0) * 0.9;
  float tearB = (fbm(vec2(w.x * 0.07, seed * 13.0 + 5.0)) - 0.5) * 5.0 + (noise(vec2(w.x * 0.55, seed + 3.0)) * 2.0 - 1.0) * 0.9;
  float dT = -(ly + hs.y) + tearT, dB = ly - hs.y + tearB, dS = abs(l.x) - hs.x;
  float d = max(max(dT, dB), dS);
  float aa = 1.2 * fwidth(local.y) / max(open, 0.05);
  float inside = smoothstep(aa, -aa, d);
  float tornD = min(dT, dB);
  float fib = smoothstep(0.55, 0.9, noise(vec2(w.x * 1.6, w.y * 0.3))) * smoothstep(2.2, 0.0, tornD) * step(0.0, tornD) * smoothstep(1.0, -1.0, dS);
  vec3 col = vec3(0.94, 0.91, 0.84);
  col *= 0.94 + 0.06 * fbm(w * 0.035 + seed * 3.0);
  col *= 0.97 + 0.03 * noise(vec2(w.x * 0.9, w.y * 0.25)) + 0.02 * (noise(w * 1.7) - 0.5);
  col = mix(col, vec3(0.8, 0.7, 0.52), pow(noise(w * 0.11 + seed * 11.0), 16.0) * 0.6);
  col *= 0.96 + 0.05 * hash(vec2(seed, 9.0));
  col = mix(col, vec3(0.88, 0.82, 0.7), smoothstep(8.0, 0.0, -d) * 0.35);
  col = mix(col, vec3(1.0, 0.99, 0.96), smoothstep(-1.4, 0.0, tornD) * smoothstep(0.0, -2.0, dS) * 0.6);
  float fx = gx - k * pw;
  float par = mod(k, 2.0);
  col *= mix(1.0, 0.95, par);
  float cr = min(fx, pw - fx);
  float crease = smoothstep(0.0, 4.0, min(gx, 2.0 * hs.x - gx));
  col *= 1.0 - (0.1 * exp(-cr / 1.2) - 0.035 * exp(-abs(fx - 2.5) / 1.5) * (1.0 - par)) * crease;
  col *= mix(0.55, 1.0, clamp(open, 0.0, 1.0));
  float lift = smoothstep(hs.x - 36.0, hs.x, l.x);
  col *= 1.0 + 0.05 * lift;
  float sh = exp(-max(max(max(-(l.y - 5.0 - 3.0 * lift + hs.y), l.y - 5.0 - 3.0 * lift - (-hs.y + 2.0 * hs.y * open)), abs(l.x - 3.0) - hs.x), 0.0) / (6.0 + 5.0 * lift)) * mix(0.34, 0.2, uLight) * (1.0 - inside);
  float a = inside + fib * 0.8 * (1.0 - inside) + sh;
  float body = smoothstep(0.0, 6.0, 2.0 * hs.y * open);
  vec3 rgb = col * inside + vec3(0.97, 0.95, 0.9) * fib * 0.8 * (1.0 - inside);
  return vec4(rgb * fade, min(a, 1.0) * fade) * body;
}`,
}
