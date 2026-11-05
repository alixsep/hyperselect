import type { Preset } from 'hyperselect'

export const sulfur: Preset = {
  name: 'sulfur',
  pad: [12, 30, 10],
  tint: [0.95, 0.82, 0.12],
  selection: { dark: 'color:#1c1400', light: 'color:#221900' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float above = -hs.y - local.y;
  float sweep = age - (local.x + hs.x) / 900.0;
  float fume = 0.0;
  if (above > -2.0 && cover < 1.0) {
    vec2 q = vec2(world.x * 0.03, world.y * 0.04 + t * 0.45) + seed * 7.0;
    fume = smoothstep(0.45, 0.85, fbm3(q + vec2(sin(world.y * 0.05 + t) * 0.3, 0.0))) * exp(-max(above, 0.0) / 11.0) * smoothstep(0.3, 1.2, sweep) * 0.45;
  }
  vec4 haze = vec4(mix(vec3(0.75, 0.7, 0.3), vec3(0.85, 0.78, 0.35), uLight) * fume, fume * mix(0.35, 0.55, uLight));
  if (sdBox(local, hs) > 6.0) return haze * fade;
  vec3 v = voronoi(world * 0.11 + seed * 9.0);
  float d = sdRBox(local, hs, 3.0) + (v.z - 0.5) * 5.0;
  float grow = smoothstep(0.0, 0.06, sweep * 2.2 - 0.04 - 0.22 * hash(vec2(v.z, 6.0)) - (hs.y - local.y) / 220.0);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d) * grow;
  vec2 facet = hash2(vec2(v.z, 3.0)) - 0.5;
  float lit = clamp(0.6 + dot(facet, vec2(-0.7, -0.9)) * 1.1, 0.25, 1.2);
  float seam = smoothstep(0.1, 0.0, v.y - v.x);
  float ridge = smoothstep(0.22, 0.08, v.y - v.x) * (1.0 - seam) * step(0.0, dot(facet, vec2(-0.7, -0.9)));
  vec3 shadow = mix(vec3(0.74, 0.58, 0.08), vec3(0.86, 0.74, 0.24), uLight);
  vec3 body = mix(vec3(0.92, 0.78, 0.16), vec3(0.98, 0.88, 0.36), uLight);
  vec3 bright = mix(vec3(1.0, 0.92, 0.42), vec3(1.0, 0.97, 0.7), uLight);
  vec3 col = mix(shadow, body, smoothstep(0.25, 0.75, lit));
  col = mix(col, bright, smoothstep(0.85, 1.2, lit));
  col = mix(col, shadow * 0.8, seam * 0.55);
  col += vec3(0.25, 0.22, 0.1) * ridge * 0.6;
  float glint = smoothstep(0.96, 1.0, sin(t * 0.8 + v.z * 60.0)) * step(0.9, lit) * 0.4;
  col += vec3(1.0, 0.98, 0.85) * glint;
  vec4 c = vec4(col * inside, inside * 0.94);
  return (c + haze * (1.0 - inside)) * fade;
}`,
}
