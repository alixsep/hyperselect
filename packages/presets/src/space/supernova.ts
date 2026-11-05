import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const supernova: Preset = {
  name: 'supernova',
  pad: [16, 10, 10],
  tint: [1, 0.52, 0.32],
  selection: {
    dark: 'color:#fff6ef;text-shadow:0 0 4px rgb(30 8 4 / .85)',
    light: 'color:#fff6ef;text-shadow:0 0 4px rgb(30 8 4 / .85)',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  vec2 origin = vec2((hash(vec2(seed, 4.0)) - 0.5) * hs.x * 0.9, (hash(vec2(seed, 5.0)) - 0.5) * hs.y * 0.4);
  vec2 p = local - origin;
  float r = length(p * vec2(1.0, 1.4));
  float front = 6.0 + (hs.x * 2.2 + 80.0) * (1.0 - exp(-age * 2.6));
  float inside = solid(d) * smoothstep(front + 3.0, front - 8.0, r);
  float flash = exp(-r / (5.0 + age * 60.0)) * exp(-age * 6.0) * 1.6;
  if (inside <= 0.0 && flash < 0.01) return vec4(0.0);
  vec2 dir = p / max(length(p), 1e-3);
  float shell = hs.x * 0.55 + 30.0 + t * 1.5 - floor(t / 40.0) * 60.0;
  float spoke = fbm(dir * 3.2 + seed * 9.0 + vec2(r * 0.006, 0.0));
  float knot = fbm3(p * 0.045 + seed * 3.0 - dir * t * 0.05);
  float ridge = 1.0 - abs(spoke * 2.0 - 1.0);
  float filament = pow(ridge, 7.0) * (0.4 + 0.9 * knot) * smoothstep(5.0, 40.0, r);
  float rim = exp(-abs(r - shell * (0.75 + 0.5 * knot)) / 28.0);
  float haze = exp(-r / (hs.x * 0.35 + 20.0));
  float wave = exp(-abs(r - front) / 3.5) * exp(-age * 1.4);
  float pulsar = point(p, 1.1) * (0.7 + 0.3 * sin(t * 6.0));
  vec3 red = vec3(1.0, 0.32, 0.22), amber = vec3(1.0, 0.68, 0.36), blue = vec3(0.4, 0.58, 1.0), white = vec3(1.0, 0.97, 0.92);
  vec3 rgb = voidColor();
  rgb += blue * haze * (0.12 + 0.12 * knot);
  rgb += mix(red, amber, knot) * filament * (0.35 + 0.65 * rim) * 0.8;
  rgb += red * rim * 0.07;
  rgb += mix(blue, white, 0.5) * wave * 1.2;
  rgb += white * pulsar;
  rgb *= inside;
  rgb += white * flash;
  float a = voidAlpha() * inside;
  if (uLight > 0.5) return over(vec4(min(rgb, vec3(a)), a), vec3(1.0, 0.82, 0.62), clamp(flash, 0.0, 1.0) * (1.0 - inside)) * fade;
  return vec4(rgb, a) * fade;
}`,
}
