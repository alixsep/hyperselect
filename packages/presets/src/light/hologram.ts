import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const hologram: Preset = {
  name: 'hologram',
  pad: [12, 8, 14],
  tint: [0.3, 0.85, 1.0],
  selection: { dark: 'color:#effcff;text-shadow:0 0 6px rgb(40 200 255 / .6)', light: 'color:#04283a' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float box = sdRBox(local, hs, 2.0);
  if (box > 12.0) return vec4(0.0);
  float rise = easeOut(age * 2.4);
  float ceiling = hs.y - (2.0 * hs.y + 2.0) * rise;
  float h = clamp((hs.y - local.y) / (2.0 * hs.y), 0.0, 1.0);
  float band = hs.y + 8.0 - fract(t * 0.21 + seed) * (2.0 * hs.y + 40.0);
  float slip = smoothstep(2.5, 0.0, abs(local.y - band)) * 2.5;
  vec2 p = local - vec2(slip, 0.0);
  float d = sdRBox(p, hs, 2.0);
  float shown = smoothstep(ceiling - 1.0, ceiling + 1.0, local.y);
  float inside = solid(d) * shown;
  float scan = 0.5 + 0.5 * sin((world.y + t * 9.0) * PI * 0.5);
  float rays = 0.55 + 0.45 * noise(vec2(world.x * 0.07 + seed * 9.0, t * 0.5));
  float lift = mix(1.0, 0.2, h);
  float roll = 0.55 + 0.45 * sin(world.y * 0.22 + t * 2.6);
  float body = inside * (0.25 + 0.75 * scan) * lift * rays * roll;
  float sides = smoothstep(2.5, 0.0, hs.x - abs(p.x)) * inside * mix(1.0, 0.3, h);
  float ghost = smoothstep(2.5, 0.0, hs.x - abs(p.x + 2.0)) * shown * solid(d - 2.0) * mix(1.0, 0.3, h);
  float head = exp(-abs(local.y - ceiling) / 1.4) * (1.0 - smoothstep(0.35, 0.7, age)) * step(abs(local.x), hs.x);
  float baseD = length(vec2(max(abs(local.x) - hs.x - 2.0, 0.0), local.y - hs.y - 2.0));
  float emitter = (smoothstep(1.4, 0.4, baseD) + exp(-baseD / 4.0) * 0.45) * smoothstep(0.0, 0.15, age);
  float hum = 0.95 + 0.05 * noise(vec2(t * 1.8, seed * 9.0));
  vec3 cyan = vec3(0.3, 0.88, 1.0), ice = vec3(0.8, 0.98, 1.0), magenta = vec3(1.0, 0.3, 0.85);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.55, 0.82, 0.94), 1.0) * clamp(inside * 0.14 + body * 0.45, 0.0, 1.0) * hum;
    c = over(c, vec3(0.86, 0.46, 0.84), ghost * 0.45);
    c = over(c, vec3(0.06, 0.52, 0.74), clamp(sides * 0.8 + emitter + head, 0.0, 1.0));
    return c * fade;
  }
  vec3 rgb = cyan * (inside * 0.05 + body * 0.34) * hum;
  rgb += magenta * ghost * 0.3 + ice * (sides * 0.55 + emitter + head);
  return vec4(rgb * fade, inside * 0.32 * fade);
}`,
}
