import type { Preset } from 'hyperselect'
import { festive } from './shared'

export const mardigras: Preset = {
  name: 'mardigras',
  pad: [20, 16, 20],
  tint: [0.62, 0.32, 0.9],
  selection: { dark: 'color:#fbf6ff;text-shadow:0 1px 2px rgb(16 0 30 / .7)', light: 'color:#22103a' },
  surface: /* glsl */ `${festive}
vec4 strand(vec2 p, float period, float sag, vec3 color, float age) {
  float spacing = 4.2;
  vec4 c = vec4(0.0);
  for (int i = -1; i <= 1; i++) {
    float x = (floor(p.x / spacing) + 0.5 + float(i)) * spacing;
    vec2 n = (p - vec2(x, drape(x, period, sag))) / 1.9;
    float bead = solid((length(n) - 1.0) * 1.9) * smoothstep(0.0, 0.2, age - fract(x * 0.013) * 0.4);
    float diffuse = clamp(dot(vec3(n, sqrt(max(1.0 - dot(n, n), 0.0))), normalize(vec3(-0.5, -0.7, 0.6))), 0.0, 1.0);
    float spec = exp(-dot(n + vec2(0.4, 0.45), n + vec2(0.4, 0.45)) * 14.0);
    c = over(c, color * (0.35 + 0.8 * diffuse) + spec * 0.8, bead);
  }
  return c;
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.13, 0.05, 0.19), vec3(0.96, 0.93, 1.0)), 1.0) * body * 0.92;
  vec3 gold = vec3(0.95, 0.72, 0.22);
  vec3 purple = vec3(0.56, 0.26, 0.86);
  vec3 green = vec3(0.18, 0.68, 0.34);
  float span = step(abs(local.x), hs.x - 2.0);
  vec4 beads = strand(vec2(world.x + 22.0, local.y + hs.y + 3.5), 44.0, 3.5, purple, age);
  beads = layer(beads, strand(vec2(world.x, local.y + hs.y + 2.5), 44.0, 4.0, gold, age - 0.1));
  beads = layer(beads, strand(vec2(world.x + 11.0, hs.y + 3.5 - local.y), 52.0, 4.0, green, age - 0.2));
  c = c * (1.0 - beads.a * span) + beads * span;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
}
