import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const bamboo: Preset = {
  name: 'bamboo',
  pad: [14, 18, 12],
  tint: [0.48, 0.7, 0.3],
  selection: { dark: 'color:#fbfdf2;text-shadow:0 1px 2px rgb(10 30 0 / .9)', light: 'color:#18260c' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float joint = 78.0 + 24.0 * hash(vec2(seed, 1.0));
  float x = local.x + hs.x;
  float shoots = age / 0.11;
  float extent = (floor(shoots) + easeOut(fract(shoots) * 1.4)) * joint;
  float k = floor(x / joint);
  float nodeX = (k + 1.0) * joint - x;
  float near = min(x - k * joint, nodeX);
  float swell = exp(-near * near * 0.25) * 1.2;
  float r = min(hs.y, 7.0);
  float d = max(sdRBox(local, hs + vec2(0.0, swell), r), local.x - (extent - hs.x));
  float aa = fwidth(local.y);
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(sdRBox(local - vec2(1.0, 4.0), hs, r), 0.0) / 5.0) * smoothstep(0.0, 1.0, (extent - x) / 20.0) * mix(0.45, 0.12, uLight);
  float v = clamp(local.y / (hs.y + swell), -1.0, 1.0);
  float lit = 0.62 + 0.38 * sqrt(1.0 - v * v) - 0.25 * smoothstep(0.2, 1.0, v);
  float glare = (v + 0.45) / 0.18;
  float shine = exp(-glare * glare);
  float segment = hash(vec2(k, seed * 3.0));
  vec3 cane = mix(mix(vec3(0.16, 0.32, 0.1), vec3(0.24, 0.38, 0.12), segment), mix(vec3(0.64, 0.8, 0.5), vec3(0.72, 0.82, 0.52), segment), uLight);
  cane = mix(cane, mix(vec3(0.38, 0.38, 0.14), vec3(0.84, 0.82, 0.58), uLight), smoothstep(20.0, 0.0, near) * 0.45);
  float fiber = noise(vec2(world.x * 0.02, local.y * 1.6 + seed * 5.0));
  vec3 col = cane * lit * (0.92 + 0.12 * fiber);
  col += mix(vec3(0.3, 0.36, 0.22), vec3(0.18, 0.2, 0.14), uLight) * shine;
  float groove = smoothstep(1.4, 0.3, near);
  col *= 1.0 - mix(0.55, 0.35, uLight) * groove;
  col += mix(vec3(0.14, 0.16, 0.08), vec3(0.06, 0.06, 0.04), uLight) * smoothstep(3.5, 1.5, near) * smoothstep(1.0, 1.8, near);
  float bloom = smoothstep(9.0, 2.0, nodeX) * step(1.5, nodeX) * 0.25;
  col = mix(col, mix(vec3(0.5, 0.56, 0.48), vec3(0.94, 0.95, 0.9), uLight), bloom);
  col *= 1.0 - 0.3 * smoothstep(-2.0, 0.0, d) * (1.0 - uLight);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh) * (1.0 - inside);
  float above = -hs.y - local.y;
  if (above > -2.0 && cover < 0.5) {
    float leafNode = floor((x + 0.5 * joint) / joint);
    float lh = hash(vec2(leafNode, seed * 7.0 + 2.0));
    float base = leafNode * joint - 2.0;
    vec2 q = vec2(x - base, above + 1.0);
    float ang = 0.32 + 0.15 * lh + sin(t * 1.4 + lh * 20.0) * 0.04;
    q = turn(q, ang);
    float len = (24.0 + 8.0 * lh) * easeOut((extent - base) / joint - 0.4) * (0.5 + 0.5 * fade);
    float u = q.x / max(len, 1.0);
    float w = 3.6 * sin(clamp(u, 0.0, 1.0) * PI) * (1.0 - 0.4 * u);
    float leaf = smoothstep(0.6, -0.6, abs(q.y - w * 0.3) - w) * step(0.0, u) * step(u, 1.0) * step(0.4, lh);
    vec3 green = mix(vec3(0.2, 0.42, 0.12), vec3(0.56, 0.74, 0.42), uLight) * (q.y > w * 0.3 ? 1.1 : 0.85);
    c = over(c, green, leaf * (1.0 - inside));
  }
  return c * fade;
}`,
}
