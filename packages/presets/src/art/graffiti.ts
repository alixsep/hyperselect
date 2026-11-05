import type { Preset } from 'hyperselect'
import { studio } from './shared'

export const graffiti: Preset = {
  name: 'graffiti',
  pad: [22, 16, 24],
  tint: [0.95, 0.4, 0.8],
  selection: { dark: 'color:#ffffff;text-shadow:0 1px 2px rgb(20 0 30 / .6)', light: 'color:#1c0a24' },
  surface: /* glsl */ `${studio}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float d = sdRBox(local, hs, min(hs.y, 9.0));
  if (fade < 0.001 || abs(local.x) > hs.x + 16.0 || local.y < -hs.y - 14.0 || local.y > hs.y + 22.0) return vec4(0.0);
  float sprayed = sweep(local.x, hs, age, 1100.0, 14.0);
  float g = smoothstep(0.0, 1.0, local.x / max(hs.x, 1.0) * 0.5 + 0.5 + (noise(world * 0.02 + seed) - 0.5) * 0.3);
  vec3 fill = mix(sky(vec3(0.5, 0.1, 0.42), vec3(1.0, 0.72, 0.88)), sky(vec3(0.12, 0.22, 0.55), vec3(0.72, 0.84, 1.0)), g);
  vec3 outline = sky(vec3(0.35, 1.0, 0.75), vec3(0.08, 0.55, 0.45));
  float halo = exp(-max(d - 2.0, 0.0) / 4.0) * step(0.0, d);
  float mist = step(hash(floor(world * 1.4) + seed), halo * 0.45);
  vec4 c = vec4(outline, 1.0) * mist * sprayed * 0.7;
  c = over(c, outline, exp(-pow((d - 2.0) / 1.7, 2.0)) * sprayed * 0.9);
  c = over(c, fill, smoothstep(1.2, -1.2, d) * sprayed * (0.9 + 0.1 * noise(world * 0.3)));
  float column = floor(world.x / 9.0);
  float h = hash(vec2(column, seed));
  float x = (column + 0.3 + 0.4 * hash(vec2(column, seed + 1.0))) * 9.0 - world.x;
  float width = 0.9 + 1.1 * h;
  float run = (4.0 + 14.0 * hash(vec2(column, seed + 2.0))) * smoothstep(0.3, 2.2, age);
  float bead = length(vec2(x, local.y - hs.y - run) / vec2(1.0, 1.25)) - width * 1.4;
  float drip = solid(min(max(abs(x) - width, max(hs.y - 3.0 - local.y, local.y - hs.y - run)), bead)) * step(0.55, h) * step(abs(local.x), hs.x - 6.0);
  c = over(c, fill, drip * sprayed);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
