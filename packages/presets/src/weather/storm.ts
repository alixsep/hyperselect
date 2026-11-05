import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const storm: Preset = {
  name: 'storm',
  pad: [26, 70, 22],
  tint: [0.5, 0.48, 0.82],
  selection: {
    dark: 'color:#f4f2ff;text-shadow:0 0 10px rgb(150 140 255 / .35)',
    light: 'color:#1a1830',
  },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 26.0 || local.y < -hs.y - 70.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.6, age);
  vec2 p = world * vec2(0.012, 0.024) + seed * 11.0;
  float mass = billow(p, t * 1.5);
  float lit = clamp((mass - billow(p + vec2(0.0, 0.12), t * 1.5)) * 6.0, -1.0, 1.0);
  float top = -hs.y - 6.0 - 26.0 * open * (0.6 + 0.8 * mass);
  float edge = max(sdRBox(local, hs + vec2(4.0, 2.0), 10.0), top - local.y);
  float cloud = (1.0 - smoothstep(-6.0, 12.0, edge + (mass - 0.5) * 22.0)) * smoothstep(0.0, 0.2, age);
  float cycle = t * 0.23 + seed * 3.0;
  float n = floor(cycle);
  float f = fract(cycle) * 4.35;
  float flash = (exp(-f * 22.0) + exp(-max(f - 0.12, 0.0) * 16.0) * step(0.12, f) * 0.8) * step(0.3, hash(vec2(n, seed)));
  float bx = (hash(vec2(n, 2.0 + seed)) - 0.5) * hs.x * 1.5;
  float y = local.y - top;
  float span = hs.y * 2.0 - top - hs.y;
  float jag = (fbm3(vec2(local.y * 0.045, n * 7.1)) - 0.5) * 34.0 + (noise(vec2(local.y * 0.35, n)) - 0.5) * 5.0;
  float boltDx = abs(local.x - bx - jag);
  float fork = abs(local.x - bx - jag - (y - span * 0.35) * 0.55 * sign(hash(vec2(n, 5.0)) - 0.5));
  float within = step(top + 4.0, local.y) * step(local.y, hs.y + 2.0);
  float forkOn = within * step(span * 0.35, y) * step(y, span * 0.75);
  float bolt = (smoothstep(1.4, 0.2, boltDx) + exp(-boltDx / 4.0) * 0.6) * within + (smoothstep(1.0, 0.1, fork) + exp(-fork / 3.0) * 0.4) * forkOn * 0.7;
  float strike = clamp(flash * 1.4, 0.0, 1.0);
  float inner = exp(-abs(local.x - bx) / 60.0) * flash;
  vec3 base = sky(vec3(0.13, 0.13, 0.23), vec3(0.62, 0.64, 0.74)) + sky(vec3(0.07, 0.07, 0.11), vec3(0.16, 0.16, 0.15)) * lit * 0.6;
  vec3 glowing = base + sky(vec3(0.55, 0.52, 0.85), vec3(0.3, 0.3, 0.4)) * inner;
  vec4 c = vec4(glowing, 1.0) * cloud * 0.95;
  float drops = rain(world - vec2(world.y * 0.15, 0.0), t, vec2(7.0, 48.0), 700.0, 22.0, 0.3, 0.5, seed);
  c = over(c, sky(vec3(0.6, 0.64, 0.85), vec3(0.3, 0.32, 0.48)), drops * open * 0.4 * (1.0 - cloud * 0.5) * step(top, local.y));
  c = over(c, sky(vec3(0.94, 0.94, 1.0), vec3(0.32, 0.26, 0.62)), clamp(bolt * strike, 0.0, 1.0));
  c += vec4(sky(vec3(0.5, 0.45, 1.0), vec3(0.0)), 0.0) * exp(-boltDx / 18.0) * within * strike * 0.35;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.7, 0.72, 0.95], [0.26, 0.26, 0.42]),
  behavior: rainfall({ density: 12, speed: 760, slant: 0.15, length: 22, splash: 3 }),
}
