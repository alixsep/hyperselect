import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const asteroids: Preset = {
  name: 'asteroids',
  pad: [14, 10, 10],
  tint: [0.66, 0.58, 0.5],
  selection: { dark: 'color:#f1ede6;text-shadow:0 0 4px rgb(8 8 10 / .9)', light: 'color:#1c1c22' },
  surface: /* glsl */ `${cosmos}
vec4 rock(vec4 below, vec2 p, float cell, float speed, float seed, float t, float grow, float lineY, float keepOut) {
  vec2 s = p + vec2(t * speed, 0.0);
  vec2 id = floor(s / cell);
  float h = hash(id + seed);
  vec2 c = (id + 0.5 + (hash2(id + seed * 3.0) - 0.5) * 0.45) * cell;
  float r = cell * (0.12 + 0.16 * hash(id + seed * 5.0)) * clamp(grow * 2.0 - h, 0.0, 1.0);
  float clear = step(keepOut, abs(c.y - lineY));
  if (h < 0.45 || r < 0.5 || clear < 0.5) return below;
  vec2 q = s - c;
  float spin = t * (hash(id + 9.0) - 0.5) * 1.6 + h * 6.0;
  float cs = cos(spin), sn = sin(spin);
  vec2 rq = vec2(cs * q.x - sn * q.y, sn * q.x + cs * q.y);
  vec2 dir = rq / max(length(rq), 1e-3);
  float lump = r * (1.0 + 0.32 * (noise(dir * 1.4 + h * 20.0) - 0.5) + 0.12 * (noise(dir * 3.5 + h * 9.0) - 0.5));
  float dist = length(q) - lump;
  float body = smoothstep(0.7, -0.7, dist);
  if (body <= 0.0) return below;
  vec2 n = q / lump;
  vec3 normal = vec3(n, sqrt(max(1.0 - dot(n, n), 0.0)));
  float lit = clamp(dot(normal, normalize(vec3(-0.6, -0.7, 0.45))), 0.0, 1.0);
  float pits = smoothstep(0.55, 0.75, noise(rq * 0.9 + h * 30.0));
  vec3 stone = mix(vec3(0.5, 0.45, 0.4), vec3(0.62, 0.56, 0.5), hash(id + 2.0));
  vec3 col = stone * (mix(0.12, 0.6, uLight) + mix(1.3, 0.7, uLight) * lit) * (1.0 - 0.3 * pits);
  return over(below, col, body);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = window(hs, 6.0, cover);
  float inside = solid(d) * smoothstep(0.0, 0.15, age);
  if (inside <= 0.0) return vec4(0.0);
  vec3 field = mix(voidColor(), vec3(0.86, 0.88, 0.91), uLight);
  vec4 c = vec4(field, 1.0) * mix(voidAlpha(), 0.9, uLight);
  vec4 s = starCell(world, 17.0, seed);
  c.rgb += starHue(s.w) * step(0.6, s.z) * point(s.xy, 0.3 + 0.4 * s.z) * 0.6 * (1.0 - uLight);
  float lineY = world.y - local.y;
  float grow = easeOut(age * 1.4);
  c = rock(c, world, 15.0, 7.0, seed, t, grow * 0.8, lineY, hs.y * 0.5);
  c = rock(c, world + vec2(0.0, 11.0), 34.0, 16.0, seed + 1.0, t, grow, lineY + 11.0, hs.y * 0.45);
  return c * inside * fade;
}`,
}
