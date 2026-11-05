import type { Preset } from 'hyperselect'
import { growth } from './shared'

export const mud: Preset = {
  name: 'mud',
  pad: [22, 14, 18],
  tint: [0.48, 0.33, 0.2],
  selection: { dark: 'color:#fff6ea;text-shadow:0 1px 2px rgb(20 10 0 / .9)', light: 'color:#1e120a' },
  surface: /* glsl */ `${growth}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float splat = easeBack(age * 2.6);
  float lump = fbm3(world * 0.035 + seed * 7.0);
  float d = sdRBox(local, hs, 9.0) + (lump - 0.5) * 12.0;
  vec2 origin = vec2((hash(vec2(seed, 1.0)) - 0.5) * hs.x, 0.0);
  float burst = length((local - origin) / vec2(hs.x * 1.3 + 30.0, hs.y + 24.0)) - splat;
  d = max(d, burst * 40.0);
  vec2 cell = floor(world / 14.0);
  vec2 spot = (cell + 0.3 + 0.4 * hash2(cell + seed)) * 14.0;
  float fleck = length(world - spot) - (1.2 + 2.4 * hash(cell + 5.0)) * smoothstep(0.3, 0.6, splat);
  float ring = sdRBox(spot - (world - local), hs, 9.0);
  fleck += step(hash(cell + 9.0), 0.55) * 20.0 + step(16.0, ring) * 20.0 + step(ring, 3.0) * 20.0;
  d = min(d, fleck);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float sh = exp(-max(d - 1.0, 0.0) / 4.0) * (1.0 - inside) * mix(0.4, 0.12, uLight) * smoothstep(0.0, 0.5, splat);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  vec2 hp = world * 0.025 + seed * 3.0;
  float h = fbm3(hp);
  vec2 slope = vec2(fbm3(hp + vec2(0.05, 0.0)), fbm3(hp + vec2(0.0, 0.05))) - h;
  vec3 nrm = normalize(vec3(-slope * 22.0 - normalize(local + 1e-4) * smoothstep(-8.0, 0.0, d) * 0.6, 1.0));
  vec3 l = normalize(vec3(-0.4, -0.7, 0.6));
  float diff = clamp(dot(nrm, l), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-l, nrm), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 12.0);
  vec3 wet = mix(vec3(0.17, 0.1, 0.055), vec3(0.62, 0.5, 0.38), uLight);
  vec3 dry = mix(vec3(0.33, 0.24, 0.16), vec3(0.76, 0.67, 0.56), uLight);
  float crust = smoothstep(-6.0, -1.0, d) * smoothstep(0.45, 0.65, lump) * smoothstep(1.0, 3.0, age);
  vec3 col = mix(wet, dry, crust * 0.7) * (0.85 + 0.3 * lump);
  col *= mix(0.7, 0.88, uLight) + mix(0.5, 0.2, uLight) * diff;
  col += vec3(1.0, 0.92, 0.82) * spec * (1.0 - crust) * mix(0.45, 0.18, uLight);
  vec2 bcell = floor(world / vec2(46.0, 30.0));
  float bh = hash(bcell + seed * 4.0);
  float cycle = fract(t * 0.22 + bh * 7.0);
  vec2 bpos = (bcell + 0.3 + 0.4 * hash2(bcell + 2.0)) * vec2(46.0, 30.0);
  float br = 3.2 * smoothstep(0.0, 0.85, cycle);
  float bd = length(world - bpos);
  float dome = step(0.55, bh) * step(cycle, 0.86) * smoothstep(br, br * 0.4, bd) * smoothstep(-3.0, -6.0, d);
  float pop = step(0.55, bh) * step(0.86, cycle) * smoothstep(0.6, 0.0, abs(bd - br * (1.0 + (cycle - 0.86) * 8.0))) * (1.0 - (cycle - 0.86) / 0.14);
  col += vec3(0.9, 0.8, 0.7) * smoothstep(0.6 * br, 0.0, length(world - bpos + vec2(0.8, 1.0))) * dome * 0.5 * (1.0 - crust);
  col *= 1.0 - 0.25 * dome * smoothstep(br * 0.5, br, bd);
  col = mix(col, col * 0.7, pop * smoothstep(-3.0, -6.0, d));
  col *= 1.0 - 0.3 * smoothstep(-2.0, 0.0, d) * (1.0 - uLight);
  return (vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh) * (1.0 - inside)) * fade;
}`,
}
