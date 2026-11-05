import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const christmas: Preset = {
  name: 'christmas',
  pad: [18, 34, 14],
  tint: [0.9, 0.25, 0.22],
  selection: { dark: 'color:#f4fff6;text-shadow:0 1px 2px rgb(0 20 8 / .6)', light: 'color:#0c2414' },
  surface: /* glsl */ `${festive}
vec3 bulb(float slot) {
  float k = mod(slot, 4.0);
  return k < 1.0 ? vec3(1.0, 0.24, 0.2) : k < 2.0 ? vec3(1.0, 0.76, 0.22) : k < 3.0 ? vec3(0.22, 0.85, 0.42) : vec3(0.3, 0.56, 1.0);
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 22.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.03, 0.14, 0.08), vec3(0.9, 0.96, 0.91)), 1.0) * body * 0.92;
  c = over(c, sky(vec3(0.85, 0.7, 0.35), vec3(0.7, 0.55, 0.2)), stroke(d + 2.0, 0.3) * body * 0.4);

  float snowLine = hs.y - 2.0 + (noise(vec2(world.x * 0.12, seed * 7.0)) - 0.5) * 3.0;
  float snow = solid(max(snowLine - local.y, d - 2.0 - noise(vec2(world.x * 0.2, seed)) * 1.5)) * smoothstep(0.1, 0.5, age);
  c = over(c, sky(vec3(0.94, 0.97, 1.0), vec3(1.0)), snow * 0.96);
  c = over(c, vec3(0.6, 0.7, 0.82), stroke(local.y - snowLine - 0.6, 0.5) * snow * 0.35);
  c = over(c, vec3(0.62, 0.72, 0.85), smoothstep(snowLine + 3.0, hs.y + 3.0, local.y) * snow * 0.35);
  vec2 grain = world / 3.0;
  float sparkle = step(0.93, hash(floor(grain) + seed)) * pow(max(sin(t * 3.0 + hash(floor(grain)) * 40.0), 0.0), 6.0);
  c = over(c, vec3(1.0), sparkle * snow * smoothstep(0.5, 0.1, length(fract(grain) - 0.5)));

  float slot = floor(world.x / 30.0);
  float wire = -hs.y - 14.0 + drape(world.x, 30.0, 5.0);
  float strung = step(abs(local.x), hs.x) * step(40.0, hs.x);
  c = over(c, sky(vec3(0.28, 0.42, 0.3), vec3(0.16, 0.3, 0.2)), stroke(local.y - wire, 0.45) * strung * 0.9);
  vec2 q = vec2(mod(world.x, 30.0) - 15.0, local.y + hs.y + 4.5);
  float cap = solid(sdBox(q - vec2(0.0, -3.6), vec2(1.1, 1.0)));
  float glass = solid(length(q * vec2(1.0, 0.75)) - 2.6);
  float lit = smoothstep(0.0, 0.15, age - 0.2 - (local.x + hs.x) / max(hs.x * 2.0, 1.0) * 0.5);
  float on = lit * (0.7 + 0.3 * sin(t * 2.2 - slot * 1.7));
  vec3 hue = bulb(slot);
  c.rgb += hue * exp(-length(q) / 4.0) * on * (1.0 - uLight) * 0.7 * strung;
  c = over(c, sky(vec3(0.62, 0.66, 0.6), vec3(0.45, 0.5, 0.45)), cap * strung);
  c = over(c, mix(hue * 0.35, mix(hue, vec3(1.0), 0.25 * on), mix(0.3, 1.0, on)), glass * strung);
  c = over(c, vec3(1.0), solid(length(q - vec2(-0.9, -0.8)) - 0.6) * glass * strung * 0.7);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
