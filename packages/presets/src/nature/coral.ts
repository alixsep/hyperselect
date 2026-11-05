import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const coral: Preset = {
  name: 'coral',
  pad: [14, 18, 10],
  tint: [0.98, 0.45, 0.38],
  selection: { dark: 'color:#fff4f0;text-shadow:0 1px 2px rgb(60 0 0 / .85)', light: 'color:#3d1410' },
  surface: /* glsl */ `${growth}
float limb(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)) - r;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  if (sdRBox(local, hs, 8.0) > 18.0) return vec4(0.0);
  float lump = fbm3(world * 0.05 + seed * 9.0);
  float rise = easeOut(age * 1.6 - (local.x + hs.x) * 0.0012);
  float floorY = hs.y + 4.0 - rise * (2.0 * hs.y + 12.0) + (lump - 0.5) * 10.0;
  float d = max(sdRBox(local, hs, 8.0) + (lump - 0.5) * 6.0, floorY - local.y);
  float above = -hs.y - local.y;
  float tree = 1e3;
  if (above > -4.0 && cover < 0.5) {
    float cell = floor(world.x / 16.0);
    for (int k = -1; k <= 1; k++) {
      float c = cell + float(k);
      float h = hash(vec2(c, seed * 5.0 + 1.0));
      float x0 = (c + 0.5) * 16.0 + (h - 0.5) * 8.0 - (world.x - local.x);
      if (abs(x0) > hs.x - 6.0 || h < 0.25) continue;
      float grow = easeOut((age - (x0 + hs.x) * 0.0012 - 0.35 - h * 0.3) / 0.8) * (0.5 + 0.5 * fade);
      float tall = (6.0 + 10.0 * hash(vec2(c, 3.0))) * grow;
      float sway = sin(t * 1.1 + h * 20.0) * 0.8 * grow;
      vec2 base = vec2(x0, -hs.y + 3.0);
      vec2 fork = base + vec2(sway * 0.5 + (h - 0.6) * 4.0, -tall * 0.6);
      vec2 tipA = fork + vec2(-3.5 + sway, -tall * 0.45);
      vec2 tipB = fork + vec2(3.0 + sway, -tall * 0.6 * hash(vec2(c, 8.0)));
      float r = 1.9 * grow;
      tree = min(tree, min(limb(local, base, fork, r + 0.4), min(limb(local, fork, tipA, r), limb(local, fork, tipB, r * 0.9))));
    }
  }
  float k = 3.0;
  float blendH = clamp(0.5 + 0.5 * (tree - d) / k, 0.0, 1.0);
  float body = mix(tree, d, blendH) - k * blendH * (1.0 - blendH);
  float aa = fwidth(body);
  float inside = smoothstep(aa, -aa, body);
  float sh = exp(-max(body - 1.0, 0.0) / 4.0) * (1.0 - inside) * mix(0.4, 0.12, uLight) * rise;
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  vec3 v = voronoi(world * 0.13 + seed * 13.0);
  float breathe = 0.16 + 0.05 * sin(t * 1.4 + v.z * 40.0);
  float mouth = smoothstep(breathe + 0.06, breathe, v.x);
  float rim = smoothstep(breathe, breathe + 0.12, v.x) * smoothstep(0.5, 0.25, v.x);
  float groove = smoothstep(0.14, 0.02, v.y - v.x);
  float hue = fbm3(world * 0.015 + seed * 3.0);
  vec3 flesh = mix(mix(vec3(0.58, 0.18, 0.17), vec3(0.98, 0.68, 0.6), uLight), mix(vec3(0.66, 0.3, 0.16), vec3(1.0, 0.78, 0.6), uLight), smoothstep(0.4, 0.7, hue));
  vec3 bright = mix(vec3(0.98, 0.52, 0.42), vec3(1.0, 0.86, 0.8), uLight);
  vec3 col = flesh * (0.85 + 0.25 * lump);
  col = mix(col, bright, rim * 0.35);
  col = mix(col, mix(vec3(0.3, 0.06, 0.08), vec3(0.82, 0.48, 0.44), uLight), mouth * 0.5);
  col *= 1.0 - mix(0.28, 0.14, uLight) * groove;
  col = mix(col, bright, smoothstep(0.0, -2.5, tree) * smoothstep(-5.0, -14.0, local.y + hs.y) * 0.5);
  col *= 1.0 - 0.35 * smoothstep(-2.5, 0.0, body) * (1.0 - uLight);
  return (vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh) * (1.0 - inside)) * fade;
}`,
}
