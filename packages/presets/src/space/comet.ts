import type { Preset } from 'hyperselect'
import { cosmos } from './shared'

export const comet: Preset = {
  name: 'comet',
  pad: [34, 10, 14],
  tint: [0.42, 0.8, 0.95],
  selection: {
    dark: 'color:#f2fbff;text-shadow:0 0 5px rgb(4 16 30 / .9)',
    light: 'color:#0d2234',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float travel = easeOut(age * 1.1);
  vec2 head = vec2(mix(-hs.x - 40.0, hs.x + 14.0, travel), -1.0 + sin(t * 0.7 + seed * 6.0));
  float behind = head.x - local.x;
  float reach = fade * (2.0 * hs.x + 220.0);
  if (behind < -26.0 || behind > reach + 40.0) return vec4(0.0);
  float flare = smoothstep(0.0, 160.0, behind);
  float spread = 3.0 + (hs.y + 3.0) * (0.25 + 0.75 * flare);
  float tail = smoothstep(reach + 40.0, reach - 40.0, behind) * smoothstep(-2.0, 10.0, behind);
  float fall = mix(1.0, 0.45, clamp(behind / (2.0 * hs.x + 60.0), 0.0, 1.0));
  float y = local.y - head.y;
  float ion = smoothstep(1.0, 0.35, abs(y) / spread) * tail * fall;
  float streak = noise(vec2((local.x + t * 70.0) * 0.012, y / spread * 3.5 + seed * 9.0));
  float fine = noise(vec2((local.x + t * 110.0) * 0.03, y / spread * 9.0 + 4.0));
  float rays = (0.45 + 0.55 * streak) * (0.75 + 0.25 * fine);
  float bend = behind * behind * 0.00018 + behind * 0.02;
  float dust = exp(-pow((y - bend) / (spread * 0.55), 2.0)) * tail * fall * smoothstep(0.0, 60.0, behind);
  float r = length((local - head) * vec2(0.8, 1.0));
  float coma = exp(-r / 7.0);
  float nucleus = point(local - head, 1.6);
  vec3 ice = vec3(0.45, 0.82, 1.0), gold = vec3(1.0, 0.82, 0.55), white = vec3(0.95, 0.99, 1.0);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.82, 0.92, 0.98), 1.0) * ion * 0.85;
    c = over(c, vec3(0.42, 0.66, 0.86), ion * rays * 0.55);
    c = over(c, vec3(0.94, 0.82, 0.6), dust * 0.4);
    c = over(c, vec3(0.3, 0.58, 0.86), coma * 0.85);
    c = over(c, vec3(0.08, 0.22, 0.42), nucleus);
    return c * smoothstep(0.0, 0.4, fade + 0.3);
  }
  vec3 rgb = ice * ion * rays * 0.42 + vec3(0.02, 0.05, 0.09) * ion + gold * dust * 0.18 + ice * coma * 0.9 + white * (nucleus * 1.4 + coma * coma * 0.6);
  return vec4(rgb, ion * 0.55) * smoothstep(0.0, 0.4, fade + 0.3);
}`,
}
