import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const nebula: Preset = {
  name: 'nebula',
  pad: [18, 12, 12],
  tint: [0.86, 0.38, 0.66],
  selection: { dark: 'color:#fff4fa', light: 'color:#fff4fa' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 1.0);
  float bloom = easeOut(age * 1.2);
  float body = max(window(hs, 10.0, cover), length(local * vec2(1.0, 3.0)) - easeOut(age * 6.0) * (hs.x + 70.0));
  vec2 p = world * 0.011 + seed * 9.0;
  vec2 drift = vec2(t * 0.015, -t * 0.01);
  float wisp = fbm3(world * 0.035 + seed * 5.0 - drift * 4.0);
  float d = body + (wisp - 0.5) * 12.0 + 2.0;
  float inside = smoothstep(2.0, -2.0, d);
  if (inside <= 0.0) return vec4(0.0);
  vec2 warp = vec2(fbm3(p + drift), fbm3(p + vec2(5.2, 1.3) - drift));
  float gas = fbm(p * 1.7 + warp * 2.4);
  vec3 violet = vec3(0.24, 0.12, 0.46), rose = vec3(0.86, 0.27, 0.52), teal = vec3(0.12, 0.58, 0.68), peach = vec3(1.0, 0.72, 0.62);
  float density = smoothstep(0.3, 0.75, gas) * mix(0.3, 1.0, bloom * smoothstep(hs.x * 1.6 * bloom + 20.0, 0.0, abs(local.x)));
  vec3 col = mix(violet, rose, smoothstep(0.38, 0.68, gas));
  col = mix(col, teal, smoothstep(0.52, 0.72, warp.y) * (1.0 - density * 0.6));
  col = mix(col, peach, smoothstep(0.66, 0.8, gas) * 0.6);
  float lane = smoothstep(0.42, 0.5, warp.x) * smoothstep(0.62, 0.5, warp.x);
  vec3 rgb = voidColor() + col * (0.12 + mix(0.75, 0.6, uLight) * density * density) * (1.0 - 0.55 * lane);
  rgb += col * smoothstep(-8.0, 0.0, d) * 0.12;
  vec4 s = starCell(world + drift * 30.0, 17.0, seed);
  float on = step(0.6, s.z) * smoothstep(0.2 + s.w, 0.6 + s.w, age);
  rgb += starHue(s.w) * point(s.xy, 0.3 + 0.7 * s.z * s.z) * on * (1.0 - lane);
  float a = voidAlpha() * inside;
  return sealed(rgb * inside, a) * fade;
}`,
}
