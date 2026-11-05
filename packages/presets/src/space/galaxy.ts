import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const galaxy: Preset = {
  name: 'galaxy',
  pad: [18, 8, 8],
  tint: [0.62, 0.64, 0.98],
  selection: { dark: 'color:#f4f5ff;text-shadow:0 0 4px rgb(8 10 28 / .9)', light: 'color:#f4f5ff;text-shadow:0 0 4px rgb(8 10 28 / .9)' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(12.0, 1.0);
  float d = window(hs, 8.0, cover);
  float inside = solid(d);
  if (inside <= 0.0) return vec4(0.0);
  vec2 n = local / hs;
  float r = length(n * vec2(1.0, 0.85));
  float reach = easeOut(age * 1.1) * 1.6 * (0.3 + 0.7 * fade);
  float spread = smoothstep(reach, reach - 0.35, r);
  float theta = atan(n.y, n.x);
  float swirl = 2.0 * theta - 7.0 * log(r + 0.03) - t * 0.12;
  float arm = pow(0.5 + 0.5 * cos(swirl), 3.0);
  float dust = fbm3(vec2(swirl * 1.3, r * 9.0) + seed * 7.0);
  float disc = exp(-r * 1.6);
  vec2 bulge = local / vec2(hs.y * 2.2, hs.y * 0.7);
  float core = exp(-dot(bulge, bulge));
  vec3 blue = vec3(0.42, 0.52, 1.0), gold = vec3(1.0, 0.78, 0.48), pink = vec3(0.95, 0.42, 0.62);
  vec3 rgb = voidColor();
  float light = disc * (0.22 + 1.1 * arm * smoothstep(0.25, 0.7, dust));
  rgb += mix(blue, gold, exp(-r * 4.0)) * light * spread * 0.6;
  rgb += pink * arm * smoothstep(0.62, 0.78, dust) * disc * spread * 0.4;
  rgb *= 1.0 - 0.6 * smoothstep(0.45, 0.25, dust) * (1.0 - arm) * spread;
  vec4 s = starCell(world + vec2(t * 2.0, 0.0), 5.0, seed);
  float speck = step(1.0 - 0.25 - 0.6 * arm * disc, s.z) * point(s.xy, 0.12 + 0.4 * s.w * s.w);
  rgb += starHue(s.w) * speck * (0.25 + 0.75 * disc) * spread;
  rgb += (gold * 0.32 + vec3(0.1) * core) * core * smoothstep(0.0, 0.4, age);
  float a = voidAlpha() * inside * smoothstep(0.0, 0.25, age);
  return sealed(rgb * a / voidAlpha(), a) * fade;
}`,
}
