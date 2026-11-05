import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const seaweed: Preset = {
  name: 'seaweed',
  pad: [14, 12, 12],
  tint: [0.5, 0.56, 0.2],
  selection: { dark: 'color:#fbfbe8;text-shadow:0 1px 2px rgb(0 0 0 / .85)', light: 'color:#1c2208' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  if (sdRBox(local, hs, 6.0) > 12.0) return vec4(0.0);
  float x = local.x + hs.x;
  float murk = smoothstep(2.0, -6.0, sdRBox(local, hs, 8.0)) * smoothstep(0.0, 40.0, age * 500.0 - x);
  vec3 deep = mix(vec3(0.02, 0.07, 0.06), vec3(0.72, 0.8, 0.72), uLight);
  vec4 col = vec4(deep, 1.0) * murk * mix(0.6, 0.35, uLight);
  float cell = floor(x / 45.0);
  for (int k = -3; k <= 0; k++) {
    float c = cell + float(k);
    float h = hash(vec2(c, seed * 11.0 + 3.0));
    float start = c * 45.0 + h * 20.0 - 10.0;
    if (start < -10.0 || start > 2.0 * hs.x - 20.0) continue;
    float span = min(110.0 + 60.0 * hash(vec2(c, 5.5)), 2.0 * hs.x + 8.0 - start);
    float grown = easeOut((age - start / 500.0 - h * 0.15) / 0.8) * (0.5 + 0.5 * fade);
    float len = span * grown;
    float u = (x - start) / max(len, 1.0);
    if (u < 0.0 || u > 1.0) continue;
    float lane = (hash(vec2(c, 7.7)) - 0.5) * hs.y * 1.1;
    float phase = h * 6.283;
    float wave = sin((x - start) * 0.045 - t * 1.4 + phase) * (1.0 + 4.0 * u) + sin(t * 0.5 + phase) * 2.0 * u;
    float dy = local.y - lane - wave;
    float ruffle = 1.0 + 0.14 * sin(x * 0.22 - t * 1.8 + phase * 3.0) + 0.06 * sin(x * 0.9 + phase);
    float broad = hs.y * (0.4 + 0.25 * hash(vec2(c, 8.1)));
    float width = mix(0.9, broad * pow(1.0 - u, 0.45) * ruffle, smoothstep(0.05, 0.22, u));
    float blade = smoothstep(0.6, -0.6, abs(dy) - width);
    vec2 pod = vec2(x - start - 0.1 * len, dy);
    float bladder = smoothstep(0.6, -0.6, length(pod * vec2(0.8, 1.0)) - 3.2 * grown) * step(0.4, hash(vec2(c, 6.6)));
    float body = max(blade, bladder);
    if (body <= 0.0) continue;
    vec3 olive = mix(mix(vec3(0.24, 0.21, 0.06), vec3(0.48, 0.42, 0.12), u), mix(vec3(0.62, 0.6, 0.4), vec3(0.76, 0.72, 0.5), u), uLight);
    olive = mix(olive, mix(vec3(0.16, 0.3, 0.12), vec3(0.56, 0.68, 0.5), uLight), hash(vec2(c, 2.2)) * 0.7);
    float rim = smoothstep(width - 1.6, width, abs(dy));
    olive += mix(vec3(0.2, 0.16, 0.04), vec3(0.07, 0.06, 0.02), uLight) * rim;
    olive *= 1.0 - 0.3 * smoothstep(0.8, 0.0, abs(dy)) * (1.0 - bladder);
    olive *= 0.9 + 0.2 * noise(vec2(x * 0.08, dy * 0.6 + h * 20.0));
    float glint = smoothstep(1.2, 0.2, length(pod + vec2(0.9, 1.0)));
    vec3 podc = mix(vec3(0.46, 0.34, 0.1), vec3(0.78, 0.66, 0.4), uLight) + vec3(0.5, 0.48, 0.3) * glint * mix(0.6, 0.4, uLight);
    col = over(col, mix(olive, podc, bladder), body * mix(0.88, 0.8, uLight));
  }
  return col * fade;
}`,
}
