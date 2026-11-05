import type { Preset } from 'hyperselect'

export const ferro: Preset = {
  name: 'ferro',
  pad: [10, 22, 8],
  tint: [0.42, 0.42, 0.72],
  selection: { dark: 'color:#eef0ff', light: 'color:#f4f5ff' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  float above = -hs.y - local.y;
  if (d > 4.0 && above < 0.0) return vec4(0.0);
  float pull = smoothstep(0.0, 1.0, age * 4.0 - (local.x + hs.x) / 900.0);
  float pitch = 9.0;
  float lean = sin(t * 0.7 + world.x * 0.005 + seed * 4.0) * 0.4;
  float u = fract((world.x + lean * max(above, 0.0)) / pitch + seed) - 0.5;
  float field = 0.55 + 0.45 * sin(world.x * 0.018 - t * 1.3 + seed * 6.0);
  float reach = 15.0 * field * pull * (1.0 - cover) * smoothstep(hs.x - 2.0, hs.x - 12.0, abs(local.x));
  float peak = 1.0 - abs(u) * 2.0;
  float height = reach * peak * peak;
  float spike = max(above - height, -above - 4.0);
  float front = -hs.x - 6.0 + age * 1800.0;
  float shape = min(max(d, local.x - front), max(spike, local.x - front));
  float aa = fwidth(shape);
  float inside = smoothstep(aa, -aa, shape);
  float sh = exp(-max(d, 0.0) / 5.0) * (1.0 - inside) * pull * mix(0.5, 0.15, uLight);
  if (inside <= 0.0) return vec4(0.0, 0.0, 0.0, sh) * fade;
  float onSpike = smoothstep(-2.0, 2.0, above);
  float flank = mix(0.0, smoothstep(0.1, -0.35, u) * peak, onSpike);
  float rim = smoothstep(1.6, 0.0, -shape);
  float tip = smoothstep(0.7, 1.0, peak) * smoothstep(height - 4.0, height, above) * onSpike;
  float gloss = exp(-abs(local.y + hs.y * 0.45) / 2.5) * (0.6 + 0.4 * noise(vec2(world.x * 0.03 - t * 0.3, seed))) * (1.0 - onSpike);
  float dimple = smoothstep(0.35, 0.0, abs(u)) * smoothstep(0.0, -6.0, above) * smoothstep(hs.y, -hs.y, local.y) * 0.25;
  vec3 base = mix(vec3(0.05, 0.05, 0.075), vec3(0.12, 0.12, 0.15), uLight);
  vec3 sheen = vec3(0.42, 0.45, 0.8);
  vec3 col = base + sheen * (flank * 0.35 + rim * 0.45 + dimple * 0.5) * mix(1.6, 1.0, uLight) + vec3(0.75, 0.78, 0.95) * gloss * 0.35 + vec3(1.0) * tip * 0.5;
  return vec4(col * inside, inside + sh * (1.0 - inside)) * fade;
}`,
}
