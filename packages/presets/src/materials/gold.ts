import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const gold: Preset = {
  name: 'gold',
  pad: [14, 10, 16],
  tint: [0.93, 0.72, 0.3],
  selection: { dark: 'color:#241703', light: 'color:#241703' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float r = 3.0;
  float open = easeOut(age * 3.2);
  vec2 box = vec2(max(hs.x * open, r + 1.0), hs.y);
  float d = sdRBox(local, box, r);
  float inside = solid(d);
  float sh = drop(sdRBox(local - vec2(1.5, 4.0), box, r), 5.0) * (1.0 - inside) * mix(0.5, 0.16, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -d;
  vec2 n = outward(local, box, r);
  float brush = fbm3(vec2(world.x * 0.012, world.y * 0.7) + seed * 9.0);
  float fine = noise(vec2(world.x * 0.05, world.y * 2.3));
  float sheen = smoothstep(0.1, 1.0, sin(world.x * 0.012 + t * 0.18 + seed * 6.0));
  float tone = 0.4 + 0.24 * smoothstep(hs.y, -hs.y, local.y) + 0.36 * sheen + 0.22 * (brush - 0.5) + 0.1 * (fine - 0.5);
  float bevel = smoothstep(3.0, 0.0, e);
  tone += bevel * (-n.y * 0.5 - n.x * 0.12);
  tone += exp(-abs(abs(local.x) - box.x) / 8.0) * (1.0 - open) * 0.8;
  tone = tone * mix(1.0, 0.8, uLight) + 0.18 * uLight;
  vec3 low = mix(vec3(0.3, 0.18, 0.04), vec3(0.62, 0.47, 0.24), uLight);
  vec3 col = mix(low, vec3(0.84, 0.61, 0.22), smoothstep(0.0, 0.6, tone));
  col = mix(col, vec3(1.0, 0.93, 0.7), smoothstep(0.6, 1.05, tone));
  col *= 1.0 - 0.45 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(col * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
