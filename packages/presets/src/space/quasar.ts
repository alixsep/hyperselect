import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const quasar: Preset = {
  name: 'quasar',
  pad: [30, 12, 12],
  tint: [0.58, 0.46, 1],
  selection: {
    dark: 'color:#f6f3ff;text-shadow:0 0 4px rgb(12 6 32 / .9)',
    light: 'color:#f6f3ff;text-shadow:0 0 4px rgb(12 6 32 / .9)',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(0.0, 0.12, age);
  vec2 core = vec2(-hs.x - 2.0, 0.0);
  vec2 q = local - core;
  float r = length(q);
  float glow = exp(-r / 9.0) + exp(-r / 26.0) * 0.35;
  if (inside <= 0.0 && glow < 0.01) return vec4(0.0);
  float run = q.x;
  float reach = age * 1500.0;
  float beam = smoothstep(reach + 30.0, reach - 30.0, run) * smoothstep(-4.0, 6.0, run);
  float w = 4.5 + run * 0.012;
  float jet = exp(-q.y * q.y / (w * w)) * mix(1.0, 0.4, clamp(run / (2.0 * hs.x), 0.0, 1.0));
  float sheath = exp(-abs(q.y) / (w * 4.0)) * 0.35;
  float knots = smoothstep(0.55, 1.0, sin((run - t * 220.0) * 0.045 + seed * 6.0) * 0.5 + 0.5) * smoothstep(0.0, 40.0, run);
  float disc = exp(-abs(q.x) / 1.4) * smoothstep(hs.y * 0.9, 0.0, abs(q.y));
  vec2 aq = abs(q);
  float spikes = (exp(-aq.y * 0.9) * exp(-aq.x * 0.12) + exp(-aq.x * 0.9) * exp(-aq.y * 0.12)) * 0.5;
  float flicker = 0.85 + 0.15 * sin(t * 1.3 + seed * 20.0);
  vec3 violet = vec3(0.5, 0.32, 1.0), blue = vec3(0.45, 0.65, 1.0), white = vec3(0.96, 0.95, 1.0), amber = vec3(1.0, 0.7, 0.4);
  vec3 rgb = voidColor() * inside;
  vec4 s = starCell(world, 21.0, seed);
  rgb += starHue(s.w) * step(0.6, s.z) * point(s.xy, 0.3 + 0.4 * s.z) * 0.6 * inside;
  rgb += (mix(blue, violet, smoothstep(0.0, 1.0, abs(q.y) / (w * 2.5))) * (jet * 0.3 + sheath * 0.3) + white * jet * knots * 0.3) * beam * inside;
  rgb += amber * disc * 0.8 * inside + (violet * 0.6 + white * 0.4) * glow * flicker + white * spikes * flicker;
  float a = max(voidAlpha() * inside, 0.0);
  if (uLight > 0.5) {
    float halo = clamp(glow * 0.8 + spikes * 0.7, 0.0, 1.0) * (1.0 - inside);
    vec4 c = vec4(min(rgb, vec3(a)), a);
    return over(c, mix(vec3(0.5, 0.36, 0.95), vec3(0.3, 0.2, 0.7), 0.5), halo) * fade;
  }
  return vec4(rgb, a) * fade;
}`,
}
