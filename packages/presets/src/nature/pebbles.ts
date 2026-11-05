import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const pebbles: Preset = {
  name: 'pebbles',
  pad: [16, 14, 16],
  tint: [0.66, 0.58, 0.5],
  selection: { dark: 'color:#fffdf8;text-shadow:0 1px 2px rgb(0 0 0 / .9),0 0 6px rgb(0 0 0 / .5)', light: 'color:#221a12' },
  surface: /* glsl */ `${growth}
vec3 pebbleColor(float h) {
  vec3 c = vec3(0.42, 0.42, 0.42);
  if (h < 0.22) c = vec3(0.56, 0.47, 0.36);
  else if (h < 0.38) c = vec3(0.5, 0.3, 0.22);
  else if (h < 0.52) c = vec3(0.26, 0.26, 0.28);
  else if (h < 0.64) c = vec3(0.78, 0.74, 0.66);
  else if (h < 0.74) c = vec3(0.36, 0.42, 0.36);
  else if (h < 0.86) c = vec3(0.62, 0.55, 0.45);
  return c;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(3.0, 1.0);
  if (sdRBox(local, hs, 6.0) > 12.0) return vec4(0.0);
  vec2 center = world - local;
  float bed = smoothstep(2.0, -4.0, sdRBox(local, hs, 6.0)) * smoothstep(0.0, 60.0, age * 900.0 - (local.x + hs.x));
  vec3 grit = mix(vec3(0.07, 0.06, 0.05), vec3(0.62, 0.58, 0.52), uLight) * (0.8 + 0.4 * noise(world * 0.8));
  vec4 col = vec4(grit, 1.0) * bed * mix(0.85, 0.5, uLight);
  vec3 light = normalize(vec3(-0.45, -0.6, 0.66));
  vec2 base = floor(world / 12.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(i, j);
    float h = hash(id + seed * 3.0);
    vec2 c = (id + 0.25 + 0.5 * hash2(id + 1.9)) * 12.0;
    vec2 lc = c - center;
    if (sdRBox(lc, hs, 6.0) > 0.0) continue;
    float pop = clamp((age - (lc.x + hs.x) / 900.0 - h * 0.35) / 0.3, 0.0, 1.0) * smoothstep(h * 0.6, h * 0.6 + 0.4, fade);
    if (pop <= 0.0) continue;
    float size = 5.0 + 2.6 * hash(id + 6.1);
    vec2 r = vec2(size, size * (0.62 + 0.3 * hash(id + 2.4))) * (0.4 + 0.6 * easeBack(pop));
    vec2 q = turn(world - c + vec2(0.0, (1.0 - easeOut(pop)) * 8.0), hash(id + 8.8) * 3.14);
    vec2 u = q / r;
    float len = pow(pow(abs(u.x), 2.6) + pow(abs(u.y), 2.6), 1.0 / 2.6);
    float dist = (len - 1.0) * min(r.x, r.y);
    float under = (length((q - turn(vec2(1.0, 2.2), hash(id + 8.8) * 3.14)) / r) - 1.0) * min(r.x, r.y);
    float shadow = smoothstep(2.5, -1.0, under) * mix(0.5, 0.25, uLight);
    col.rgb *= 1.0 - shadow;
    col.a = max(col.a, shadow * mix(0.7, 0.35, uLight));
    float inside = smoothstep(0.6, -0.6, dist);
    if (inside <= 0.0) continue;
    float dome = sqrt(max(1.0 - len * len, 0.0));
    vec3 n = normalize(vec3(turn(u / r * 2.2, -hash(id + 8.8) * 3.14), dome + 0.15));
    float diff = clamp(dot(n, light), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 24.0);
    vec3 stone = pebbleColor(hash(id + 4.2)) * (0.9 + 0.2 * fbm3(q * 0.35 + h * 50.0));
    stone = mix(stone * 0.6, mix(stone, vec3(0.95, 0.94, 0.92), 0.55), uLight);
    float band = step(0.8, hash(id + 7.7)) * smoothstep(0.5, 0.15, abs(u.y + (h - 0.5) * 0.8)) * 0.35;
    stone = mix(stone, vec3(0.9, 0.88, 0.82) * mix(0.75, 1.0, uLight), band);
    vec3 shaded = stone * (mix(0.35, 0.78, uLight) + mix(0.95, 0.3, uLight) * diff) + vec3(1.0, 0.98, 0.94) * spec * mix(0.45, 0.25, uLight);
    shaded *= 1.0 - 0.3 * smoothstep(-1.2, 0.0, dist);
    col = over(col, shaded, inside);
  }
  return col * fade;
}`,
}
