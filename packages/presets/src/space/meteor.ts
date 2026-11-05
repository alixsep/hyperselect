import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const meteor: Preset = {
  name: 'meteor',
  pad: [12, 8, 8],
  tint: [1, 0.66, 0.42],
  selection: { dark: 'color:#fff6ec', light: 'color:#fff6ec' },
  surface: /* glsl */ `${cosmos}
float streak(vec2 p, float t, float seed) {
  vec2 dir = normalize(vec2(1.0, 0.36));
  float u = dot(p, dir), v = dot(p, vec2(-dir.y, dir.x));
  vec2 cell = vec2(floor(u / 300.0), floor(v / 12.0));
  float across = (fract(v / 12.0) - 0.5) * 12.0;
  float period = 1.8 + 2.4 * hash(cell + seed);
  float cycle = t / period + hash(cell + 3.7);
  float when = fract(cycle) * period;
  float live = step(0.4, hash(cell + floor(cycle) * 1.3 + 9.1));
  float span = 0.35 + 0.2 * hash(cell + 5.5);
  float head = 60.0 + when / span * 230.0;
  float behind = head - (u - cell.x * 300.0);
  float len = 70.0 + 60.0 * hash(cell + 7.7);
  float trail = smoothstep(-1.0, 1.0, behind) * pow(max(1.0 - behind / len, 0.0), 2.0);
  float width = smoothstep(1.3, 0.0, abs(across)) + exp(-abs(across) * 0.7) * 0.3;
  float life = smoothstep(0.0, 0.05, when) * smoothstep(span, span * 0.6, when);
  return trail * width * life * live;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float fire = -hs.x - 30.0 + age * 2400.0;
  float inside = solid(d) * smoothstep(-30.0, 0.0, fire - local.x - hs.x * 0.0);
  if (inside <= 0.0) return vec4(0.0);
  float dusk = smoothstep(-hs.y - 6.0, hs.y + 6.0, local.y + cover * 18.0);
  vec3 sky = mix(vec3(0.02, 0.024, 0.07), vec3(0.11, 0.05, 0.12), dusk * dusk);
  sky = mix(sky, sky * 1.25 + vec3(0.02, 0.02, 0.05), uLight);
  vec3 rgb = sky;
  vec4 s = starCell(world, 19.0, 0.0);
  rgb += starHue(s.w) * step(0.55, s.z) * point(s.xy, 0.25 + 0.5 * s.z * s.z) * 0.55;
  float shower = streak(world, t, 0.0) * smoothstep(0.3, 0.9, age);
  rgb += mix(vec3(1.0, 0.72, 0.46), vec3(1.0, 0.96, 0.9), shower) * shower;
  vec2 q = local - vec2(fire, -hs.y * 0.2);
  float behind = -q.x;
  float bolide = smoothstep(-2.0, 2.0, behind) * exp(-behind / 120.0) * exp(-abs(q.y + behind * 0.03) / (1.2 + behind * 0.012));
  bolide += exp(-length(q) / 4.0) * 1.4;
  rgb += mix(vec3(1.0, 0.55, 0.3), vec3(1.0, 0.95, 0.85), min(bolide, 1.0)) * bolide * (1.0 - smoothstep(2.0 * hs.x, 2.0 * hs.x + 120.0, fire + hs.x));
  return sealed(rgb * inside, voidAlpha() * inside) * fade;
}`,
}
