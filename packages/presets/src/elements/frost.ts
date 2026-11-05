import type { Preset } from 'hyperselect'

export const frost: Preset = {
  name: 'frost',
  pad: [14, 10, 10],
  tint: [0.56, 0.84, 1],
  selection: { dark: 'color:#f3faff;text-shadow:0 1px 3px rgb(4 18 34 / .95)', light: 'color:#0b2234' },
  surface: /* glsl */ `
float dendrite(vec2 q, float size, float seed) {
  float r = length(q);
  if (r > size + 1.5) return 0.0;
  float a = atan(q.y, q.x) + seed * 6.2832;
  float sector = floor(a / (PI / 3.0));
  float lead = floor(seed * 6.0);
  float arm = size * (mod(sector - lead, 6.0) == 0.0 ? 1.0 : 0.12 + 0.3 * hash(vec2(sector, seed * 13.0)));
  a = mod(a, PI / 3.0) - PI / 6.0;
  vec2 p = r * vec2(cos(a), abs(sin(a)));
  float spine = p.x < arm ? p.y : length(p - vec2(arm, 0.0));
  float gap = 3.2 + 1.2 * seed;
  float xb = clamp(gap * floor((p.x - p.y * 0.577) / gap + 0.5), 0.0, arm);
  vec2 dir = vec2(0.5, 0.866);
  float u = clamp(dot(p - vec2(xb, 0.0), dir), 0.0, (arm - xb) * 0.4);
  float branch = length(p - vec2(xb, 0.0) - dir * u);
  float width = 0.25 + 0.45 * (1.0 - r / max(size, 1.0));
  return smoothstep(width + 0.7, width - 0.3, min(spine, branch * 1.15));
}

vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 3.0);
  float d = sdRBox(local, hs, 6.0);
  if (d > 6.0) return vec4(0.0);
  float cell = 40.0;
  vec2 g = world / cell + seed * 5.0;
  vec2 base = floor(g - 0.5);
  float ice = 0.0;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 id = base + vec2(float(i), float(j));
    vec2 h = hash2(id);
    vec2 q = (g - id - 0.2 - 0.6 * h) * cell;
    float born = 0.1 + (local.x - q.x + hs.x) / 650.0 + 0.5 * hash(id + 4.7);
    float size = clamp((age - born) * 1.1, 0.0, 1.0) * cell * (0.5 + 0.18 * h.x);
    ice = max(ice, dendrite(q, size, hash(id + 2.1)));
  }
  ice *= smoothstep(3.0, -1.0, d);
  float aa = fwidth(d);
  float pane = smoothstep(aa, -aa, d) * smoothstep(0.2, 0.9, age - (local.x + hs.x) / 650.0);
  float rime = smoothstep(9.0, 0.0, -d) * (0.4 + 0.6 * noise(world * 0.45 + 3.0)) * pane;
  float glint = pow(noise(world * 0.8 + 7.0), 10.0) * (0.5 + 0.5 * sin(t * 2.0 + hash(floor(world * 0.4)) * 6.28)) * ice;
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.84, 0.92, 0.97), 1.0) * pane * 0.5;
    c = over(c, vec3(0.93, 0.97, 1.0), rime * 0.6);
    c = over(c, vec3(0.42, 0.63, 0.8), ice * 0.7);
    return c * fade;
  }
  vec3 rgb = vec3(0.05, 0.12, 0.2) * pane + vec3(0.5, 0.7, 0.85) * rime * 0.25 + vec3(0.7, 0.86, 1.0) * ice * 0.6 + vec3(1.0) * glint;
  float a = pane * 0.55 + rime * 0.15 + ice * 0.3;
  return vec4(rgb, min(a, 1.0)) * fade;
}`,
}
