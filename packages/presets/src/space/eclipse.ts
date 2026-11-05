import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const eclipse: Preset = {
  name: 'eclipse',
  pad: [26, 18, 18],
  tint: [0.96, 0.78, 0.5],
  selection: { dark: 'color:#f7f2e6', light: 'color:#f7f2e6' },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, -1.0);
  float d = sdRBox(local, hs, hs.y);
  float inside = solid(d);
  float flank = max(abs(local.x) - (hs.x - hs.y), 0.0) * sign(local.x);
  vec2 cap = vec2(flank, local.y);
  float around = abs(local.x) < hs.x - hs.y ? local.x : sign(local.x) * (hs.x - hs.y) + atan(cap.y, abs(cap.x)) * hs.y * sign(local.x);
  float beyond = max(d, 0.0);
  float total = smoothstep(0.1, 0.9, age);
  float streamer = fbm3(vec2(around * 0.11 + seed * 13.0, beyond * 0.012 - t * 0.05));
  float ray = smoothstep(0.3, 0.8, streamer);
  float corona = exp(-beyond / 3.5) * 0.6 + exp(-beyond / (3.0 + 11.0 * ray)) * ray * 0.6;
  corona *= 1.0 - cover * smoothstep(0.0, -4.0, local.y);
  float chromo = smoothstep(2.0, 0.4, abs(d - 0.6)) * (0.6 + 0.4 * noise(vec2(around * 0.3, t * 0.4)));
  vec2 bead = vec2(hs.x * (0.35 + 0.5 * hash(vec2(seed, 2.0))), -hs.y);
  float diamond = exp(-length(local - bead) / 3.0) * (1.0 - smoothstep(0.2, 1.3, age)) * smoothstep(0.0, 0.1, age);
  float flare = exp(-abs(local.y - bead.y) * 1.2) * exp(-abs(local.x - bead.x) * 0.08) * diamond;
  vec3 moon = mix(vec3(0.006, 0.006, 0.01), vec3(0.03, 0.03, 0.04), uLight) + vec3(0.02, 0.025, 0.04) * smoothstep(hs.y, -hs.y, local.y) * (1.0 - uLight);
  vec3 pearl = mix(vec3(0.95, 0.92, 0.86), vec3(0.9, 0.62, 0.24), uLight);
  vec3 rose = vec3(0.95, 0.35, 0.4);
  float glow = corona * total * (1.0 - inside);
  float bright = diamond * 2.0 + flare;
  if (uLight > 0.5) {
    vec4 c = vec4(pearl, 1.0) * clamp(glow * 0.6, 0.0, 1.0);
    c = over(c, rose, chromo * total * 0.8);
    c = over(c, moon, inside);
    c = over(c, vec3(0.96, 0.7, 0.3), clamp(bright, 0.0, 1.0));
    return c * fade;
  }
  vec3 rgb = pearl * glow * 0.8 + rose * chromo * total * 0.7 + vec3(1.0, 0.97, 0.9) * bright;
  rgb = rgb * (1.0 - inside) + moon * inside + rose * chromo * total * 0.3 * inside;
  return vec4(rgb, inside * 0.97) * fade;
}`,
}
