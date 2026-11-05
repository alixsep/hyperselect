import type { Preset } from 'hyperselect'
import { rainfall, raindrops } from './rainfall'
import { atmosphere } from './shared'

export const sleet: Preset = {
  name: 'sleet',
  pad: [22, 60, 20],
  tint: [0.62, 0.74, 0.84],
  selection: { dark: 'color:#f2f7fb', light: 'color:#17212b' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 60.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.4, age);
  float body = solid(d) * open;
  float freeze = smoothstep(0.2, 2.5, age);
  vec3 steel = sky(vec3(0.09, 0.13, 0.17), vec3(0.8, 0.86, 0.9));
  vec4 c = vec4(steel, 1.0) * body * 0.92;
  float rim = stroke(d, 0.5);
  if (body > 0.0) {
    float glazeEdge = (fbm3(world * 0.06 + seed * 3.0) - 0.5) * hs.x * 2.4 + local.x;
    float glaze = smoothstep(-6.0, 6.0, (freeze * 2.4 - 1.2) * hs.x - glazeEdge + hs.x) * body;
    float band = pow(0.5 + 0.5 * sin((world.x - world.y * 1.6) * 0.05 + fbm3(world * 0.03) * 4.0), 6.0);
    float rime = step(0.6, noise(world * 0.6 + seed)) * step(0.5, noise(world * 0.13));
    c = over(c, sky(vec3(0.3, 0.42, 0.52), vec3(0.93, 0.97, 1.0)), glaze * 0.35);
    c = over(c, sky(vec3(0.75, 0.87, 0.97), vec3(1.0)), glaze * (band * 0.2 + rime * 0.12));
    c = over(c, sky(vec3(0.8, 0.9, 1.0), vec3(0.55, 0.68, 0.8)), rim * glaze * 0.7);
  }
  float drops = rain(world - vec2(world.y * 0.18, 0.0), t, vec2(7.0, 44.0), 600.0, 16.0, 0.3, 0.45, seed);
  c = over(c, sky(vec3(0.62, 0.74, 0.86), vec3(0.3, 0.42, 0.54)), drops * open * solid(d - 52.0) * mix(0.35, 0.8, 1.0 - body));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: raindrops([0.7, 0.8, 0.92], [0.28, 0.4, 0.52]),
  behavior: rainfall({ density: 10, speed: 620, slant: 0.18, length: 16, splash: 1, pellets: 0.45 }),
}
