import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const bubblegum: Preset = {
  name: 'bubblegum',
  pad: [52, 40, 20],
  tint: [1, 0.48, 0.72],
  selection: { dark: 'color:#fff5fa', light: 'color:#3a0c24' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 52.0 || local.y < -hs.y - 40.0 || local.y > hs.y + 20.0) return vec4(0.0);
  float period = 3.4 + seed;
  float clock = age + seed * 5.0;
  float cycle = fract(clock / period);
  float grow = smoothstep(0.05, 0.85, cycle);
  float popped = step(0.86, cycle);
  float burst = smoothstep(0.86, 1.0, cycle);
  float r = mix(3.0, min(22.0, hs.y + 12.0), grow * grow) * (1.0 - popped) * smoothstep(0.3, 0.8, age);
  vec2 mouth = vec2(hs.x - 2.0, -1.0);
  vec2 center = mouth + vec2(r * 0.85, -r * 0.35);
  vec2 q = local - center;
  float wobble = sin(atan(q.y, q.x) * 3.0 + t * 4.0) * 0.6 * grow;
  float bubble = length(q) - r - wobble;
  float slab = sdRBox(local, hs, min(hs.y, 12.0));
  float k = 4.0;
  float hh = clamp(0.5 + 0.5 * (bubble - slab) / k, 0.0, 1.0);
  float d = mix(bubble, slab, hh) - k * hh * (1.0 - hh);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec3 pink = sky(vec3(0.62, 0.16, 0.38), vec3(1.0, 0.62, 0.8));
  vec3 deep = sky(vec3(0.42, 0.08, 0.26), vec3(0.98, 0.45, 0.68));
  float thin = smoothstep(0.0, r, r - length(q)) * step(-0.5, -bubble);
  vec3 gum = mix(deep, pink, smoothstep(-hs.y, hs.y, -local.y) * 0.5 + 0.3);
  gum = mix(gum, sky(vec3(0.85, 0.35, 0.6), vec3(1.0, 0.75, 0.88)), (1.0 - thin) * step(bubble, 0.0) * 0.6);
  vec4 c = vec4(gum, 1.0) * body * mix(0.88, 0.94, uLight);
  vec2 s = q - vec2(-0.35, -0.4) * r;
  float spec = exp(-dot(s, s) / max(r * r * 0.03, 0.5)) * step(bubble, 0.0);
  float sheen = exp(-pow((local.y + hs.y * 0.55) / 2.0, 2.0)) * step(slab, 0.0) * 0.35;
  c = over(c, vec3(1.0), (spec * 0.85 + sheen) * body);
  float shards = 0.0;
  for (int i = 0; i < 7; i++) {
    float a = float(i) * 0.898 + seed * 6.0;
    vec2 dir = vec2(cos(a), sin(a));
    vec2 p = local - mouth - dir * (6.0 + burst * 24.0) - vec2(0.0, burst * burst * 10.0);
    shards += solid(length(p * vec2(1.0, 1.6)) - 2.2 * (1.0 - burst));
  }
  c = over(c, pink, min(shards, 1.0) * popped * (1.0 - burst));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
