import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const vines: Preset = {
  name: 'vines',
  pad: [16, 16, 16],
  tint: [0.3, 0.58, 0.24],
  selection: { dark: 'color:#f3faea;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#10240c' },
  surface: /* glsl */ `${growth}
float stemY(float x, float amp, float phase) {
  return amp * (0.75 * sin(x * 0.045 + phase) + 0.25 * sin(x * 0.11 + phase * 2.0));
}

float stemSlope(float x, float amp, float phase) {
  return amp * (0.75 * 0.045 * cos(x * 0.045 + phase) + 0.25 * 0.11 * cos(x * 0.11 + phase * 2.0));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  if (abs(local.x) > hs.x + 16.0) return vec4(0.0);
  float tip = -hs.x - 6.0 + age * 520.0;
  float ahead = tip - local.x;
  float amp = hs.y * 0.55;
  float phase = seed * 6.283;
  float wash = smoothstep(2.0, -6.0, sdRBox(local, hs, 8.0)) * smoothstep(-10.0, 40.0, ahead);
  vec3 shade = mix(vec3(0.03, 0.09, 0.03), vec3(0.72, 0.82, 0.62), uLight);
  vec4 col = vec4(shade, 1.0) * wash * mix(0.55, 0.35, uLight);
  float reach = clamp(ahead / 30.0, 0.0, 1.0);
  float slope = stemSlope(local.x, amp, phase);
  float vine = abs(local.y - stemY(local.x, amp, phase)) / sqrt(1.0 + slope * slope) - 1.6 * reach;
  float wood = smoothstep(0.6, -0.6, vine) * step(0.0, ahead) * smoothstep(hs.x + 10.0, hs.x, local.x);
  vec3 bark = mix(vec3(0.24, 0.2, 0.08), vec3(0.6, 0.56, 0.4), uLight) * (0.75 + 0.45 * smoothstep(1.5, -1.0, vine + 0.8));
  col = over(col, bark, wood);
  float node = floor(local.x / 24.0);
  for (int k = -1; k <= 1; k++) {
    float n = node + float(k);
    float h = hash(vec2(n, seed * 9.0 + 1.0));
    float x0 = (n + 0.5) * 24.0 + (h - 0.5) * 6.0;
    if (abs(x0) > hs.x + 4.0) continue;
    float grown = easeBack((tip - x0) / 60.0 - h * 0.2) * smoothstep(h * 0.5, h * 0.5 + 0.5, fade);
    if (grown <= 0.02) continue;
    float side = mod(n, 2.0) < 1.0 ? -1.0 : 1.0;
    vec2 root = vec2(x0, stemY(x0, amp, phase));
    float ang = atan(stemSlope(x0, amp, phase)) + side * (1.05 + 0.35 * h) + sin(t * 1.1 + n * 1.7) * 0.07;
    vec2 q = turn(local - root, ang);
    float len = (11.0 + 4.0 * hash(vec2(n, 3.3))) * grown;
    q.x -= 3.0 * grown;
    float u = q.x / len;
    float w = len * 0.95 * sqrt(max((u + 0.18) * (1.0 - u), 0.0)) * (1.0 - 0.45 * max(u, 0.0));
    float notch = (0.08 - u) * len * 1.4 - abs(q.y);
    float leaf = max(max(abs(q.y) - w, max(-u - 0.18, u - 1.0) * len), notch);
    float petiole = max(abs(q.y) - 0.55, max(q.x, -q.x - 3.0 * grown));
    float shadow = smoothstep(2.5, -1.0, leaf - 1.2) * 0.35 * (1.0 - smoothstep(0.6, -0.6, leaf));
    col.rgb *= 1.0 - shadow;
    col.a = max(col.a, shadow * mix(0.6, 0.3, uLight));
    float body = smoothstep(0.6, -0.6, leaf);
    float tone = hash(vec2(n, 5.1));
    vec3 green = mix(mix(vec3(0.08, 0.24, 0.07), vec3(0.18, 0.38, 0.1), tone), mix(vec3(0.45, 0.66, 0.36), vec3(0.6, 0.76, 0.46), tone), uLight);
    float vein = smoothstep(0.7, 0.1, abs(q.y)) + smoothstep(0.35, 0.05, abs(abs(q.y) - u * len * 0.45 * (1.0 - u))) * 0.6;
    green += mix(vec3(0.16, 0.2, 0.1), vec3(0.12, 0.12, 0.08), uLight) * vein * smoothstep(1.0, 0.2, u);
    green *= q.y * side > 0.0 ? 1.08 : 0.88;
    green += vec3(0.1, 0.12, 0.08) * smoothstep(0.75, 1.0, 1.0 - abs(q.y / max(w, 0.1) + 0.4)) * (1.0 - uLight) * 0.6;
    col = over(col, bark, smoothstep(0.5, -0.5, petiole) * step(0.0, ahead + 12.0));
    col = over(col, green, body);
    if (mod(n, 3.0) == 1.0) {
      vec2 coil = local - root - vec2(4.0, -side * 5.0) * grown;
      float r = length(coil);
      float turns = atan(coil.y * side, coil.x) / 6.283 + 0.5;
      float pitch = 1.7 * grown + 0.01;
      float spiral = abs(fract(r / pitch - turns + 0.5) - 0.5) * pitch;
      float curl = smoothstep(0.6, 0.2, spiral) * step(r, 4.5 * grown) * step(0.8, r);
      col = over(col, bark * 1.2, curl * 0.9);
    }
  }
  return col * fade;
}`,
}
