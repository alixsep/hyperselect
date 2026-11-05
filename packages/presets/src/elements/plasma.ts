import type { Preset } from 'hyperselect'

export const plasma: Preset = {
  name: 'plasma',
  pad: [22, 16, 16],
  tint: [1, 0.3, 0.72],
  selection: { dark: 'color:#fff4fb;text-shadow:0 0 6px rgb(120 0 80 / .9)', light: 'color:#3a0630' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 12.0));
  float ig = (hash(vec2(seed, 5.0)) - 0.5) * hs.x;
  float reach = age * 800.0;
  float lit = smoothstep(0.0, -50.0, abs(local.x - ig) - reach);
  float shock = exp(-abs(abs(local.x - ig) - reach) / 8.0) * step(reach, 2.0 * hs.x + 60.0);
  float aura = exp(-max(d, 0.0) / 9.0) * lit;
  if (d > 1.0) {
    vec3 ac = mix(vec3(0.75, 0.12, 0.6), vec3(0.95, 0.55, 0.85), uLight);
    return vec4(ac * aura * mix(0.35, 0.3, uLight), aura * mix(0.0, 0.25, uLight)) * fade;
  }
  float body = smoothstep(1.0, -1.0, d);
  float core = smoothstep(hs.y + 2.0, 0.0, abs(local.y));
  vec2 p = world * vec2(0.011, 0.032) - vec2(t * 0.45, 0.0) + seed * 9.0;
  vec2 w = vec2(fbm3(p + vec2(0.0, t * 0.22)), fbm3(p * 1.3 + vec2(3.1, -t * 0.17)));
  float f = fbm(p * 1.5 + (w - 0.5) * 3.2);
  float ribbon = 1.0 - abs(sin(f * 11.0 + w.x * 5.0 - t * 0.6));
  ribbon = ribbon * ribbon * ribbon * ribbon;
  float heat = clamp(f * 0.9 + core * 0.35 + ribbon * 0.35 + shock * 0.6, 0.0, 1.0);
  vec3 deep = vec3(0.32, 0.03, 0.42), magenta = vec3(0.95, 0.12, 0.55), rose = vec3(1.0, 0.55, 0.5), white = vec3(1.0, 0.92, 0.95);
  vec3 col = mix(deep, magenta, smoothstep(0.25, 0.6, heat));
  col = mix(col, rose, smoothstep(0.65, 0.9, heat));
  col += white * ribbon * core * 0.3;
  float edge = exp(d / 2.5);
  col += vec3(1.0, 0.45, 0.8) * edge * 0.35;
  if (uLight > 0.5) {
    vec3 pale = mix(vec3(0.97, 0.82, 0.93), vec3(0.95, 0.45, 0.75), smoothstep(0.35, 0.95, heat));
    pale = mix(pale, vec3(0.75, 0.15, 0.55), ribbon * 0.45);
    vec4 c = vec4(vec3(0.95, 0.55, 0.85), 1.0) * aura * 0.25 * (1.0 - body);
    c = over(c, pale, body * lit * 0.9);
    c = over(c, vec3(0.85, 0.3, 0.65), edge * body * lit * 0.5);
    return c * fade;
  }
  float a = body * lit * 0.88;
  vec3 rgb = col * a + vec3(0.9, 0.3, 0.7) * aura * 0.3 * (1.0 - body) + vec3(1.0, 0.8, 0.95) * shock * body * 0.6;
  return vec4(rgb, a) * fade;
}`,
}
