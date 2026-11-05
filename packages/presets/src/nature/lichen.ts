import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const lichen: Preset = {
  name: 'lichen',
  pad: [16, 12, 12],
  tint: [0.72, 0.74, 0.42],
  selection: { dark: 'color:#fbfcf2;text-shadow:0 1px 2px rgb(0 0 0 / .9),0 0 6px rgb(0 0 0 / .4)', light: 'color:#1f2210' },
  surface: /* glsl */ `${growth}
vec3 lichenColor(float h) {
  if (h < 0.4) return vec3(0.6, 0.67, 0.52);
  if (h < 0.62) return vec3(0.8, 0.72, 0.3);
  if (h < 0.8) return vec3(0.9, 0.52, 0.16);
  return vec3(0.78, 0.8, 0.74);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float band = sdRBox(local, hs, 8.0);
  if (band > 12.0) return vec4(0.0);
  vec2 center = world - local;
  float grain = noise(world * 1.1 + seed * 9.0);
  float film = smoothstep(1.0, -5.0, band + (fbm3(world * 0.05 + seed) - 0.5) * 10.0) * smoothstep(0.2, 1.2, age - (local.x + hs.x) / 900.0);
  vec3 stoneTone = mix(vec3(0.16, 0.17, 0.15), vec3(0.8, 0.81, 0.77), uLight) * (0.9 + 0.2 * grain);
  vec4 col = vec4(stoneTone, 1.0) * film * mix(0.7, 0.5, uLight);
  vec2 base = floor(world / 20.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(i, j);
    float h = hash(id + seed * 5.0);
    vec2 c = (id + 0.2 + 0.6 * hash2(id + 4.3)) * 20.0;
    if (sdRBox(c - center, hs, 6.0) > 1.0) continue;
    float spread = easeOut((age - (c.x - center.x + hs.x) / 900.0 - h * 0.6) / 1.4) * (0.4 + 0.6 * smoothstep(h * 0.5, h * 0.5 + 0.5, fade));
    float radius = (8.0 + 7.0 * hash(id + 1.1)) * spread;
    if (radius < 0.5) continue;
    vec2 q = world - c;
    float r = length(q);
    vec2 dir = q / max(r, 1e-3);
    float lobed = radius * (1.0 + 0.13 * (noise(dir * 2.6 + h * 30.0) - 0.5) * 2.0 + 0.07 * sin(atan(q.y, q.x) * 9.0 + h * 20.0));
    float dist = r - lobed;
    float body = smoothstep(0.6, -0.6, dist);
    if (body <= 0.0) continue;
    float kind = hash(id + 7.7);
    vec3 tone = lichenColor(kind);
    tone = mix(tone * mix(0.62, 1.0, uLight), mix(tone, vec3(0.97, 0.96, 0.9), 0.35), uLight);
    float u = r / max(lobed, 0.1);
    float rings = 0.5 + 0.5 * sin(u * 16.0 - h * 20.0);
    vec3 lc = tone * (0.86 + 0.12 * rings * smoothstep(0.2, 0.9, u)) * (0.85 + 0.25 * grain);
    lc = mix(lc, lc * mix(0.7, 0.85, uLight), smoothstep(0.5, 0.0, u) * 0.5);
    lc += tone * 0.22 * smoothstep(-2.5, -0.5, dist);
    lc *= 1.0 - 0.35 * smoothstep(-0.8, 0.4, dist) * (1.0 - uLight);
    vec2 dc = q * 0.7;
    vec2 di = floor(dc);
    vec2 df = fract(dc) - 0.5;
    float cup = step(0.72, hash(di + id)) * smoothstep(0.55, 0.2, u) * step(0.4, kind) * step(kind, 0.8);
    float disc = smoothstep(0.32, 0.22, length(df));
    lc = mix(lc, mix(vec3(0.5, 0.2, 0.05), vec3(0.85, 0.5, 0.25), uLight), disc * cup * 0.85);
    lc += vec3(0.25, 0.15, 0.05) * smoothstep(0.32, 0.25, length(df + vec2(0.08))) * disc * cup * 0.5;
    float shadow = smoothstep(2.5, -0.5, dist - 1.0) * (1.0 - body) * 0.35;
    col.rgb *= 1.0 - shadow;
    col = over(col, lc, body * mix(0.9, 0.82, uLight));
  }
  return col * fade;
}`,
}
