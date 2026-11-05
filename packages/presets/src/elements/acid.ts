import type { Preset } from 'hyperselect'

export const acid: Preset = {
  name: 'acid',
  pad: [14, 12, 30],
  tint: [0.62, 0.95, 0.12],
  selection: { dark: 'color:#0d1a00', light: 'color:#122000' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float head = -hs.x - 30.0 + age * 900.0;
  float spill = smoothstep(-30.0, 0.0, head - local.x);
  float eat = (fbm(world * 0.07 + seed * 6.0) - 0.5) * (4.0 + 5.0 * smoothstep(0.5, 3.0, age));
  float d = max(sdRBox(local, hs, 5.0) + eat, local.x - head + local.y * local.y / (2.0 * hs.y + 4.0));
  float colm = floor(world.x / 17.0);
  float hc = hash(vec2(colm, seed * 7.0 + 2.0));
  float x0 = (colm + 0.3 + 0.4 * hash(vec2(colm, 3.0))) * 17.0;
  float len = (2.0 + 22.0 * hc) * smoothstep(0.6 + 1.6 * hash(vec2(colm, 8.0)), 3.5, age) * step(hc, 0.45) * step(abs(x0 - world.x + local.x), hs.x - 8.0);
  float below = local.y - hs.y + 2.0;
  float dx = world.x - x0;
  float neck = abs(dx) - (2.2 - 1.2 * clamp(below / max(len, 1.0), 0.0, 1.0));
  float stem = max(neck, max(-below, below - len));
  float bulb = length(vec2(dx, below - len)) - 2.8 * step(1.0, len);
  float drip = min(stem, bulb);
  float k = 3.0;
  float hd = clamp(0.5 + 0.5 * (drip - d) / k, 0.0, 1.0);
  float shape = mix(drip, d, hd) - k * hd * (1.0 - hd);
  float aa = fwidth(shape);
  float inside = smoothstep(aa, -aa, shape);
  float fume = 0.0;
  float above = -hs.y - local.y;
  if (above > 0.0 && cover < 1.0) {
    fume = smoothstep(0.45, 0.8, fbm3(vec2(world.x * 0.04, world.y * 0.05 + t * 0.6) + seed * 3.0)) * exp(-above / 6.0) * spill * 0.35;
  }
  vec3 fumeC = mix(vec3(0.45, 0.85, 0.15), vec3(0.6, 0.8, 0.3), uLight);
  vec4 haze = vec4(fumeC * fume, fume * mix(0.3, 0.6, uLight));
  if (inside <= 0.0) return haze * fade;
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec2 cell = world / 11.0, id = floor(cell);
  float hb = hash(id + seed * 5.0);
  float phase = fract(t * (0.25 + 0.3 * hb) + hb * 7.0);
  vec2 bc = fract(cell) - 0.5 - (hash2(id + 1.3) - 0.5) * 0.4;
  float r = 0.06 + 0.32 * phase;
  float bl = length(bc);
  float bubble = step(hb, 0.4) * smoothstep(0.1, 0.02, abs(bl - r)) * (1.0 - phase) * smoothstep(-4.0, -7.0, d);
  float glint = step(hb, 0.4) * smoothstep(0.1, 0.0, length(bc + vec2(r * 0.45, r * 0.5))) * (1.0 - phase);
  float swirl = fbm(world * vec2(0.03, 0.06) + vec2(t * 0.15, -t * 0.08) + seed);
  vec3 bright = mix(vec3(0.55, 0.95, 0.1), vec3(0.72, 0.95, 0.26), uLight);
  vec3 deep = mix(vec3(0.12, 0.38, 0.02), vec3(0.42, 0.72, 0.08), uLight);
  vec3 col = mix(bright, deep, depth * 0.7 + (swirl - 0.5) * 0.6);
  float rim = smoothstep(2.5, 0.0, -shape);
  col = mix(col, mix(vec3(0.85, 1.0, 0.45), vec3(0.28, 0.52, 0.02), uLight), rim * 0.75);
  col = mix(col, mix(vec3(0.8, 1.0, 0.5), vec3(0.32, 0.58, 0.04), uLight), bubble * 0.7);
  col = mix(col, vec3(0.96, 1.0, 0.85), glint * 0.8);
  col += mix(vec3(0.15, 0.35, 0.0), vec3(0.0), uLight) * smoothstep(0.5, 0.8, swirl);
  vec4 c = vec4(col * inside, inside * mix(0.86, 0.8, uLight));
  return (c + haze * (1.0 - inside)) * fade;
}`,
}
