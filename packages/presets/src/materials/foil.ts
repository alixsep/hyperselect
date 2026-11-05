import type { Preset } from 'hyperselect'
import { slab } from './shared'

export const foil: Preset = {
  name: 'foil',
  pad: [14, 10, 16],
  tint: [0.78, 0.8, 0.84],
  selection: { dark: 'color:#0a0c10', light: 'color:#0a0c10' },
  surface: /* glsl */ `${slab}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float open = easeOut(age * 2.8);
  vec2 box = vec2(hs.x, max(hs.y * open, 0.5));
  float d = sdRBox(local, box, 1.0) + (noise(world * 0.35 + seed) - 0.5) * 2.2;
  float inside = solid(d);
  float sh = drop(sdRBox(local - vec2(1.0, 3.0), box, 1.0), 4.0) * (1.0 - inside) * mix(0.45, 0.15, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float e = -d;
  vec2 q = world + seed * 97.0;
  float h = 0.6 * (1.0 - abs(noise(q * 0.028) * 2.0 - 1.0))
          + 0.3 * (1.0 - abs(noise(vec2(q.x * 0.05 + q.y * 0.03, q.y * 0.06 - q.x * 0.025)) * 2.0 - 1.0))
          + 0.1 * (1.0 - abs(noise(q * 0.12) * 2.0 - 1.0));
  vec3 nrm = bump(h, 12.0 * (1.0 + 2.0 * (1.0 - open)));
  vec3 light = normalize(vec3(-0.4 + 0.3 * sin(t * 0.3 + seed * 6.0), -0.6, 0.7));
  float spec = pow(max(dot(reflect(-light, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
  float facing = dot(nrm.xy, normalize(vec2(-0.5, -0.85)));
  float tone = mix(0.66, 0.72, uLight) + mix(0.34, 0.26, uLight) * facing + 0.35 * spec;
  vec3 col = mix(vec3(0.42, 0.44, 0.48), vec3(0.98, 0.98, 0.97), clamp(tone, 0.0, 1.0));
  col = mix(col, col * vec3(1.03, 1.0, 0.95), smoothstep(0.3, 0.7, noise(q * 0.02)));
  col *= 1.0 - 0.4 * smoothstep(1.0, 0.0, e);
  vec4 c = vec4(min(col, vec3(1.0)) * inside, inside) + vec4(0.0, 0.0, 0.0, sh);
  return c * fade;
}`,
}
