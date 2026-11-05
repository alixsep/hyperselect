import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const kites: Preset = {
  name: 'kites',
  pad: [24, 70, 16],
  tint: [0.4, 0.72, 0.95],
  selection: { dark: 'color:#f3faff', light: 'color:#10202e' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 24.0 || local.y < -hs.y - 70.0 || local.y > hs.y + 16.0) return vec4(0.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float breeze = smoothstep(-hs.y - 60.0, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.1, 0.18, 0.32), vec3(0.07, 0.12, 0.22), breeze), mix(vec3(0.78, 0.9, 1.0), vec3(0.9, 0.95, 1.0), breeze)), 1.0) * body * 0.9;
  float slot = 110.0;
  float id = floor((world.x + seed * 400.0) / slot);
  float h = hash(vec2(id, seed));
  float launch = smoothstep(0.1 + h * 0.4, 1.3 + h * 0.4, age);
  vec2 anchor = vec2((id + 0.5) * slot - seed * 400.0 - (world.x - local.x), hs.y * 0.2);
  vec2 kite = anchor + vec2(18.0 + sin(t * 0.9 + h * 9.0) * 7.0, mix(0.0, -hs.y - 38.0 - h * 12.0, launch) + sin(t * 1.3 + h * 5.0) * 3.0);
  float sway = sin(t * 1.1 + h * 7.0) * 0.25;
  vec2 q = turn(sway) * (local - kite);
  float diamond = abs(q.x) / 8.0 + abs(q.y) / (q.y < 0.0 ? 9.0 : 15.0) - 1.0;
  float sail = solid(diamond * 8.0) * launch;
  float quarter = step(0.0, q.x) == step(0.0, q.y) ? 1.0 : 0.0;
  vec3 a = candy(h), b = candy(fract(h + 0.4));
  vec3 sailColor = mix(a, b, quarter) * (0.85 + 0.15 * smoothstep(-9.0, 15.0, q.y));
  float spars = (stroke(q.x, 0.35) + stroke(q.y, 0.35)) * sail * 0.6;
  float stringLine = segment(local, kite, anchor);
  float string = stroke(stringLine, 0.35) * launch * step(local.y, hs.y);
  vec2 tailStart = kite + turn(-sway) * vec2(0.0, 15.0);
  float u = local.y - tailStart.y;
  float tailX = tailStart.x - u * 0.2 + sin(u * 0.28 - t * 6.0 + h * 9.0) * 3.0;
  float tail = stroke(local.x - tailX, 0.45) * step(0.0, u) * step(u, 26.0) * launch;
  float bowY = mod(u, 8.0) - 4.0;
  float bows = solid(abs(local.x - tailX) * 0.5 + abs(bowY) - 1.6) * step(0.0, u) * step(u, 26.0) * launch;
  vec3 line = sky(vec3(0.85, 0.88, 0.95), vec3(0.35, 0.4, 0.5));
  c = over(c, line, string * 0.5 + tail * 0.6);
  c = over(c, b, bows);
  c = over(c, sailColor, sail);
  c = over(c, sky(vec3(0.15, 0.1, 0.08), vec3(0.25, 0.18, 0.12)), spars);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
