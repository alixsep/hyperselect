import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const solar: Preset = {
  name: 'solar',
  pad: [12, 18, 8],
  tint: [1, 0.58, 0.14],
  selection: { dark: 'color:#2a0c00', light: 'color:#2a0c00' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  float rise = easeOut(age * 3.0) * smoothstep(0.0, 0.6, fade);
  vec2 hs = vec2(halfSize.x + 6.0, (halfSize.y - 1.0) * rise);
  float top = -hs.y - cover * 6.0;
  float d = sdRBox(local - vec2(0.0, cover * -3.0), hs + vec2(0.0, cover * 3.0), min(5.0, hs.y));
  float inside = solid(d);
  float lane = floor((local.x + hs.x) / 120.0);
  float cx = -hs.x + (lane + 0.3 + 0.4 * hash(vec2(lane, seed))) * 120.0;
  float size = 14.0 + 10.0 * hash(vec2(lane, seed + 3.0));
  float lift = (5.0 + 4.0 * hash(vec2(lane, seed + 5.0)) + 1.5 * sin(t * 0.5 + lane * 2.0)) * smoothstep(0.3, 1.0, age);
  vec2 lp = vec2((local.x - cx) / size, (local.y - top) / max(lift, 0.5));
  float arch = abs(length(lp) - 1.0) * lift;
  float loop = (smoothstep(1.8, 0.3, arch) * 0.8 + exp(-arch / 3.0) * 0.45) * step(lp.y, 0.0) * step(0.5, hash(vec2(lane, seed + 9.0))) * (1.0 - cover);
  loop *= 0.7 + 0.3 * noise(vec2(atan(lp.y, lp.x) * 6.0, t * 0.8 + lane));
  float spicule = exp(-max(d, 0.0) / 2.5) * (1.0 - inside) * (0.5 + 0.5 * noise(vec2(world.x * 0.5, t)));
  if (inside <= 0.0 && loop + spicule < 0.01) return vec4(0.0);
  vec3 cell = voronoi(world * 0.2 + vec2(0.0, t * 0.04) + seed * 11.0);
  float granule = smoothstep(0.0, 0.5, cell.y - cell.x) * (0.8 + 0.2 * sin(t * 0.8 + cell.z * 30.0));
  float heat = fbm(world * vec2(0.012, 0.03) + vec2(t * 0.03, seed * 5.0));
  float limb = smoothstep(0.0, 7.0, -d);
  vec2 sp = local - vec2((hash(vec2(seed, 6.0)) - 0.5) * hs.x * 1.4, (hash(vec2(seed, 7.0)) - 0.5) * hs.y * 0.6);
  float sr = length(sp * vec2(0.8, 1.0));
  float pen = smoothstep(5.0, 4.0, sr) * step(0.5, hash(vec2(seed, 8.0)));
  float umbra = smoothstep(2.4, 1.6, sr) * pen;
  float fibrils = 0.6 + 0.4 * sin(atan(sp.y, sp.x) * 14.0);
  vec3 ember = mix(vec3(0.82, 0.36, 0.08), vec3(0.97, 0.56, 0.18), uLight);
  vec3 flame = mix(vec3(1.0, 0.68, 0.28), vec3(1.0, 0.84, 0.5), uLight);
  vec3 col = mix(ember, flame, mix(0.35, 0.85, granule) * (0.5 + 0.5 * heat));
  col *= mix(0.72, 1.0, limb);
  col = mix(col, ember * 0.55 * fibrils, pen * 0.75);
  col = mix(col, vec3(0.16, 0.05, 0.02), umbra);
  vec3 rose = vec3(1.0, 0.36, 0.14);
  vec4 c = vec4(rose, 1.0) * clamp(loop * 0.85 + spicule * 0.5, 0.0, 1.0);
  c = over(c, col, inside);
  return c * fade;
}`,
}
