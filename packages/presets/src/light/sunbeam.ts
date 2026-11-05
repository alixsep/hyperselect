import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const sunbeam: Preset = {
  name: 'sunbeam',
  pad: [14, 28, 10],
  tint: [1.0, 0.78, 0.36],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(40 22 0 / .8)', light: 'color:#3a2504' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float box = sdRBox(local, hs, 6.0);
  if (box > 26.0) return vec4(0.0);
  vec2 dir = normalize(vec2(0.6, 1.0));
  float across = dot(world, vec2(dir.y, -dir.x));
  float shafts = fbm3(vec2(across * 0.02, t * 0.06 + seed * 5.0));
  float fine = noise(vec2(across * 0.11, t * 0.15));
  float along = dot(local, dir);
  float beam = (0.3 + 0.7 * smoothstep(0.4, 0.66, shafts)) * (0.75 + 0.25 * fine) * (1.0 - 0.4 * smoothstep(-40.0, 40.0, along));
  float inside = solid(box);
  float spill = smoothstep(12.0, 0.0, box) * 0.4;
  float shaft = smoothstep(-28.0, 0.0, local.y + hs.y) * smoothstep(hs.x, hs.x - 16.0, abs(local.x)) * (1.0 - cover);
  float reach = max(inside, max(spill, shaft * 0.7));
  float sweep = age * 900.0 - (local.x - local.y * 0.6 + hs.x + 30.0);
  float shown = smoothstep(0.0, 120.0, sweep);
  vec2 mp = world / 12.0 + vec2(t * 0.12 + seed, -t * 0.08);
  vec2 cell = floor(mp), f = fract(mp) - 0.5;
  float mh = hash(cell + 3.1);
  vec2 mo = (hash2(cell) - 0.5) * 0.6;
  float twinkle = 0.5 + 0.5 * sin(t * (0.8 + mh * 1.6) + mh * 40.0);
  float mote = smoothstep(0.11, 0.05, length(f - mo)) * step(mh, 0.16) * beam * twinkle * inside;
  vec3 gold = vec3(1.0, 0.8, 0.46), warm = vec3(1.0, 0.62, 0.28);
  float k = beam * reach * shown;
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.99, 0.8, 0.46), 1.0) * clamp(inside * 0.1 * shown + k * 0.62, 0.0, 1.0);
    c = over(c, vec3(0.86, 0.6, 0.2), mote * shown * 0.8);
    return c * fade;
  }
  vec3 rgb = gold * k * 0.42 + warm * inside * shown * 0.04 + vec3(1.0, 0.94, 0.8) * mote * shown;
  return vec4(rgb * fade, inside * shown * 0.25 * fade);
}`,
}
