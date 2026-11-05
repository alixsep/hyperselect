import type { Preset } from 'hyperselect'
import { optics } from './shared'

export const beacon: Preset = {
  name: 'beacon',
  pad: [24, 14, 14],
  tint: [1, 0.8, 0.42],
  selection: { dark: 'color:#fff8ea;text-shadow:0 1px 3px rgb(6 10 24 / .9)', light: 'color:#1a1606' },
  surface: /* glsl */ `${optics}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (d > 14.0) return vec4(0.0);
  float inside = solid(d);
  float angle = t * 1.3 + seed * 0.4;
  float swing = cos(angle);
  float facing = pow(max(sin(angle), 0.0), 6.0);
  float kindle = easeOut(age * 1.6);
  float reach = (2.0 * hs.x + 20.0) * sqrt(abs(swing)) * easeOut(age * 0.7);
  vec2 lamp = vec2(-hs.x + 6.0, -hs.y * 0.1);
  float along = (local.x - lamp.x) * sign(swing);
  float y = local.y - lamp.y;
  float width = 3.0 + max(along, 0.0) * 0.09;
  float cone = exp(-y * y / (width * width)) * step(0.0, along) * smoothstep(reach, reach * 0.55, along);
  float mist = 0.55 + 0.75 * fbm3(world * vec2(0.025, 0.06) + vec2(t * 0.25, seed * 4.0));
  float beam = cone * mist * kindle * (0.6 + 0.4 * abs(swing));
  float r = length(local - lamp);
  float core = (exp(-r / 4.0) + exp(-r / 14.0) * 0.5 * (0.4 + facing)) * kindle;
  float bloom = exp(-r / 60.0) * facing * 0.35 * kindle;
  float light = beam + core + bloom;
  vec3 warm = mix(vec3(1.0, 0.72, 0.34), vec3(1.0, 0.95, 0.85), clamp(core + cone * 0.4, 0.0, 1.0));
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.8, 0.84, 0.9), 1.0) * inside * 0.45 * kindle;
    c = over(c, vec3(1.0, 0.76, 0.34), clamp(beam * 0.8 + bloom, 0.0, 0.85));
    c = over(c, vec3(0.96, 0.58, 0.12), clamp(core, 0.0, 1.0));
    return c * fade;
  }
  float night = inside * 0.7 * kindle;
  vec3 rgb = vec3(0.04, 0.06, 0.13) * night + warm * light;
  return vec4(rgb, max(night, min(light, 1.0) * 0.4)) * fade;
}`,
}
