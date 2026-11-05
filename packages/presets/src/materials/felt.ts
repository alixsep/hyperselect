import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const felt: Preset = {
  name: 'felt',
  pad: [14, 10, 16],
  tint: [0.22, 0.52, 0.38],
  selection: { dark: 'color:#f2fff8', light: 'color:#08201a' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float x = clamp(age * 3.5, 0.0, 1.0) - 1.0;
  float pop = 1.0 + 2.2 * x * x * x + 1.2 * x * x;
  vec2 p = local / max(pop, 0.05);
  float d = sdRBox(p, hs, 5.0) + (noise(world * 0.5) - 0.5) * 1.4;
  float inside = smoothstep(0.8, -0.8, d);
  float fibers = max(smoothstep(0.6, 0.78, noise(vec2(world.x * 1.7 + world.y * 0.4, world.y * 0.25))), smoothstep(0.6, 0.78, noise(vec2(world.x * 0.3, world.y * 1.7 - world.x * 0.5) + 7.0)));
  float hair = fibers * smoothstep(4.0, 0.0, d) * (1.0 - inside);
  float sh = drop(sdRBox(p - vec2(1.0, 4.0), hs, 5.0), 6.0) * (1.0 - inside) * mix(0.5, 0.15, uLight);
  vec3 wool = mix(vec3(0.15, 0.4, 0.28), vec3(0.52, 0.72, 0.6), uLight);
  float shown = smoothstep(0.0, 0.2, pop);
  if (inside <= 0.0) return vec4(wool * hair * 0.7, max(hair * 0.7, sh)) * fade * shown;
  float e = -d;
  float tuft = fbm3(world * 0.25 + seed * 3.0);
  float fuzz = noise(world * 1.3);
  float mottle = fbm(world * 0.03 + seed * 7.0);
  vec3 col = wool * (0.86 + 0.18 * tuft + 0.1 * (fuzz - 0.5) + 0.12 * (mottle - 0.5));
  col *= 0.94 + 0.08 * smoothstep(hs.y, -hs.y, p.y);
  col *= 1.0 + 0.1 * fibers;
  col *= mix(mix(0.7, 0.86, uLight), 1.0, smoothstep(0.0, 5.0, e));
  vec4 c = vec4(col * inside, inside) + vec4(wool * hair * 0.7, max(hair * 0.7, sh)) * (1.0 - inside);
  return c * fade * shown;
}`,
}
