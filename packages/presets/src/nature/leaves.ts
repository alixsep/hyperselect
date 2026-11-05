import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const leaves: Preset = {
  name: 'leaves',
  pad: [18, 14, 16],
  tint: [0.36, 0.62, 0.2],
  selection: { dark: 'color:#f6fbe9;text-shadow:0 1px 2px rgb(0 0 0 / .8)', light: 'color:#13240a' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float d = sdRBox(local, hs, 8.0);
  if (d > 14.0) return vec4(0.0);
  vec2 center = world - local;
  float shade = fbm3(world * 0.04 + seed * 9.0);
  vec3 deep = mix(vec3(0.03, 0.08, 0.025), vec3(0.58, 0.68, 0.48), uLight) * (0.7 + 0.6 * shade);
  float band = smoothstep(1.0, -3.0, d + (shade - 0.5) * 8.0) * smoothstep(0.0, 40.0, age * 900.0 - (local.x + hs.x));
  vec4 col = vec4(deep * band, band) * mix(0.92, 0.7, uLight);
  vec2 base = floor(world / 15.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(i, j);
    float h = hash(id + seed * 7.0);
    vec2 c = (id + 0.2 + 0.6 * hash2(id + 3.1)) * 15.0;
    vec2 lc = c - center;
    if (sdRBox(lc, hs - vec2(1.0, 0.0), 6.0) > 0.0) continue;
    float pop = easeBack((age - (lc.x + hs.x) / 900.0 - h * 0.3) / 0.35) * smoothstep(h * 0.6, h * 0.6 + 0.4, fade);
    if (pop < 0.05) continue;
    float ang = hash(id + 5.7) * 6.283 + sin(t * 1.2 + h * 30.0 + c.x * 0.02) * 0.06;
    float len = (9.5 + 3.5 * hash(id + 2.2)) * pop;
    vec2 q = turn(world - c, ang);
    float u = clamp(q.x / len, -1.0, 1.0);
    float w = len * 0.44 * (1.0 - u * u) * (1.0 - 0.25 * u);
    float leaf = max(abs(q.y) - w, abs(q.x) - len);
        float behind = max(abs(q.y + 1.5) - w, abs(q.x - 1.0) - len);
    float shadow = smoothstep(3.0, -1.0, behind) * mix(0.45, 0.22, uLight);
    col.rgb *= 1.0 - shadow;
    col.a = max(col.a, shadow * 0.6);
    float inside = smoothstep(0.7, -0.7, leaf);
    if (inside <= 0.0) continue;
    float tone = hash(id + 9.3);
    vec3 green = mix(mix(vec3(0.1, 0.24, 0.06), vec3(0.3, 0.5, 0.13), tone), mix(vec3(0.62, 0.76, 0.48), vec3(0.8, 0.88, 0.64), tone), uLight);
    green = mix(green, mix(vec3(0.42, 0.42, 0.1), vec3(0.84, 0.82, 0.5), uLight), step(0.88, hash(id + 4.4)));
    float side = q.y > 0.0 ? 0.82 : 1.08;
    float rib = smoothstep(0.9, 0.2, abs(q.y)) * smoothstep(1.0, 0.3, u);
    float vein = smoothstep(0.3, 0.05, abs(fract((q.x - abs(q.y) * 1.3) / 3.2) - 0.5)) * smoothstep(0.5, 2.0, abs(q.y)) * 0.5;
    float rim = smoothstep(-1.6, 0.0, leaf);
    vec3 tinted = green * side * (0.85 + 0.25 * (1.0 - u) * 0.5) * (1.0 - 0.3 * rim);
    tinted += mix(vec3(0.1, 0.13, 0.04), vec3(0.08, 0.08, 0.04), uLight) * (rib + vein);
    tinted += vec3(0.08, 0.1, 0.04) * smoothstep(0.6, 1.0, noise(q * 0.5 + h * 40.0 + vec2(t * 0.3, 0.0))) * (1.0 - uLight);
    col = over(col, tinted, inside);
  }
  return col * fade;
}`,
}
