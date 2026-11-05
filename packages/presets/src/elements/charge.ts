import type { Preset } from 'hyperselect'

export const charge: Preset = {
  name: 'charge',
  pad: [18, 14, 14],
  tint: [0.42, 0.78, 1],
  selection: { dark: 'color:#f2faff;text-shadow:0 0 5px rgb(60 150 255 / .7)', light: 'color:#0a1f3d' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float rd = min(hs.y, 7.0);
  float d = sdRBox(local, hs, rd);
  if (d > 12.0) return vec4(0.0);
  float charged = smoothstep(0.0, 0.9, age - (local.x + hs.x) / 1600.0);
  bool flank = abs(local.x) > hs.x - rd;
  float s = flank ? world.y * 1.3 + sign(local.x) * 3000.0 : world.x + sign(local.y) * 7000.0;
  float id = floor(s / 6.0);
  float tick = floor(t * 13.0 + hash(vec2(id, seed)) * 9.0);
  float cluster = smoothstep(0.35, 0.75, noise(vec2(s * 0.02, t * 0.7 + seed * 5.0)));
  float exposed = (!flank && local.y < 0.0) ? 1.0 - cover : 1.0;
  float live = step(hash(vec2(id, tick)), 0.5 * cluster * charged * exposed);
  float len = (3.0 + 8.0 * hash(vec2(id, tick + 1.0))) * ((!flank && local.y > 0.0) ? 0.6 : 1.0);
  float outward = max(d, 0.0);
  float cx = (id + 0.5) * 6.0 + (noise(vec2(outward * 0.8, id * 1.7 + tick * 3.1)) - 0.5) * 6.0 * smoothstep(0.0, 3.0, outward);
  float across = abs(s - cx);
  float reach = step(-1.5, d) * smoothstep(len, len - 2.0, d);
  float arc = smoothstep(0.9, 0.15, across) * reach * live;
  float glow = exp(-across / 2.5) * reach * live * 0.45;
  float fuzz = exp(-outward / 3.5) * step(-1.0, d) * (0.4 + 0.6 * noise(vec2(s * 0.25, t * 3.0))) * charged;
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  vec2 g = floor(world / 3.0);
  float speck = step(hash(g + floor(t * 9.0) * 0.37 + seed), 0.012) * inside * charged;
  float sheen = inside * (0.5 + 0.5 * fbm3(world * 0.04 + vec2(t * 0.2, -t * 0.1))) * charged;
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.86, 0.92, 1.0), 1.0) * sheen * 0.55;
    c = over(c, vec3(0.6, 0.78, 1.0), clamp(fuzz * 0.45 + glow, 0.0, 1.0));
    c = over(c, vec3(0.16, 0.42, 0.9), clamp(arc + speck, 0.0, 1.0));
    return c * fade;
  }
  vec3 cyan = vec3(0.3, 0.68, 1.0), white = vec3(0.88, 0.96, 1.0);
  vec3 rgb = vec3(0.03, 0.06, 0.12) * sheen + cyan * (fuzz * 0.3 + glow) + white * (arc + speck) * 1.1 + cyan * sheen * 0.06;
  return vec4(rgb, sheen * 0.6) * fade;
}`,
}
