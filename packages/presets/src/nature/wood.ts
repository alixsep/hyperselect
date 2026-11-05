import type { Preset } from 'hyperselect'

export const wood: Preset = {
  name: 'wood',
  pad: [20, 16, 24],
  tint: [0.62, 0.45, 0.26],
  selection: { dark: 'color:#fbf1d6', light: 'color:#2b1d0e' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(7.0, 3.0);
  float rd = 2.0;
  float d = sdRBox(local, hs, rd) + (noise(world * 0.7 + 3.0) - 0.5) * 1.0;
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float lay = smoothstep(0.0, 26.0, age * 1500.0 - (local.x + hs.x));
  vec2 p = world;
  vec2 knotC = vec2((hash(vec2(seed, 1.0)) - 0.5) * hs.x * 1.5, (hash(vec2(seed, 2.0)) - 0.5) * hs.y * 0.8);
  float kd = length((local - knotC) * vec2(1.0, 1.6));
  float warp = fbm(vec2(p.x * 0.0022, p.y * 0.04) + 7.0) * 1.6 + fbm(vec2(p.x * 0.012, p.y * 0.16) + 2.0) * 0.22;
  float ringCoord = p.y * 0.06 + warp * 1.8 + 1.4 / (0.25 + kd * 0.06);
  float ring = fract(ringCoord);
  float late = smoothstep(0.42, 0.72, ring) * (1.0 - smoothstep(0.82, 1.0, ring));
  float fiber = noise(vec2(p.x * 0.22, p.y * 2.6 + warp * 4.0));
  float pores = smoothstep(0.7, 0.95, noise(vec2(p.x * 0.5, p.y * 3.2 + 9.0))) * smoothstep(0.2, 0.6, late);
  vec3 early = mix(vec3(0.5, 0.35, 0.2), vec3(0.93, 0.82, 0.64), uLight);
  vec3 latec = mix(vec3(0.33, 0.2, 0.1), vec3(0.8, 0.64, 0.44), uLight);
  vec3 col = mix(early, latec, late * 0.85);
  col *= 0.86 + 0.28 * fiber;
  col = mix(col, col * mix(0.55, 0.8, uLight), pores * 0.6);
  col *= 0.82 + 0.36 * fbm(p * 0.008 + 3.0);
  col = mix(col, mix(vec3(0.30, 0.17, 0.07), vec3(0.6, 0.43, 0.26), uLight), smoothstep(6.0, 1.5, kd) * 0.85);
  col *= 1.0 - 0.25 * smoothstep(11.0, 5.0, kd) * late;
  float crest = 1.0 - abs(ring - 0.35) * 2.5;
  col += vec3(0.10, 0.08, 0.05) * pow(max(crest, 0.0), 6.0) * (0.5 + 0.5 * smoothstep(hs.y, -hs.y, local.y));
  float edge = -d;
  float bev = smoothstep(4.0, 0.0, edge);
  col *= 1.0 - 0.18 * bev;
  col *= 1.0 + 0.30 * bev * smoothstep(0.0, -3.0, local.y + hs.y - 6.0) * step(local.y, 0.0);
  col *= 1.0 - 0.45 * bev * step(0.0, local.y);
  col *= 1.0 - 0.5 * smoothstep(1.2, 0.0, edge);
  float sh = exp(-max(sdRBox(local - vec2(2.0, 5.0), hs, rd), 0.0) / 6.0) * (1.0 - inside) * mix(0.65, 0.13, uLight);
  float a = inside * lay + sh * lay;
  vec3 rgb = min(col, vec3(1.0)) * inside * lay;
  return vec4(rgb * fade, a * fade);
}`,
}
