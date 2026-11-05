import type { Preset } from 'hyperselect'

export const lava: Preset = {
  name: 'lava',
  pad: [16, 10, 16],
  tint: [1, 0.36, 0.06],
  selection: { dark: 'color:#fff3e4;text-shadow:0 1px 2px rgb(20 4 0 / .9)', light: 'color:#1c0904' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 2.0);
  float front = -hs.x - 24.0 + age * 520.0;
  float lip = local.x - front + local.y * local.y / (1.5 * hs.y + 4.0);
  float wob = (noise(world * 0.08 + vec2(t * 0.2, seed * 9.0)) - 0.5) * 4.0;
  float d = max(sdRBox(local, hs, min(hs.y, 9.0)) + wob, lip);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float halo = exp(-max(d, 0.0) / 7.0) * (1.0 - inside);
  vec3 haloC = mix(vec3(0.7, 0.12, 0.0), vec3(0.95, 0.45, 0.2), uLight);
  vec4 outside = vec4(haloC * halo * mix(0.45, 0.3, uLight), halo * mix(0.2, 0.3, uLight));
  if (inside <= 0.0) return outside * fade;
  vec2 p = world * vec2(0.024, 0.06) + vec2(-t * 0.1, 0.0) + seed * 13.0;
  vec2 bend = vec2(fbm3(p * 0.8 + vec2(0.0, t * 0.03)), fbm3(p * 0.8 + 4.3));
  vec3 v = voronoi(p + (bend - 0.5) * 1.2);
  float seam = v.y - v.x;
  float flow = fbm(world * vec2(0.012, 0.03) + vec2(-t * 0.08, t * 0.02) + seed * 5.0);
  float fresh = smoothstep(90.0, 0.0, front - local.x);
  float deep = smoothstep(0.0, -7.0, d);
  float raftEdge = 0.06 + 0.3 * smoothstep(0.35, 0.7, flow) + fresh;
  float raft = smoothstep(raftEdge, raftEdge + 0.05, seam) * deep;
  float glowLine = exp(-max(raftEdge - seam, 0.0) * 14.0) * deep;
  float stream = noise(vec2(world.x * 0.03 - t * 0.5, world.y * 0.22 + seed * 7.0));
  float heat = clamp(0.2 + 0.35 * stream + 0.3 * flow + glowLine * 0.45 + fresh * 0.4, 0.0, 1.0) * (1.0 - raft);
  float crustShade = 0.8 + 0.4 * hash(vec2(v.z, 2.0)) + 0.5 * (noise(world * 0.25) - 0.5) + 0.25 * (noise(world * 0.8) - 0.5);
  crustShade *= 0.7 + 0.3 * smoothstep(0.0, 0.25, seam - raftEdge);
  vec3 crust = mix(vec3(0.11, 0.075, 0.065), vec3(0.46, 0.37, 0.34), uLight) * crustShade;
  crust += vec3(0.5, 0.08, 0.0) * smoothstep(0.06, 0.0, seam - raftEdge) * raft * 0.6;
  vec3 hot = mix(vec3(0.62, 0.07, 0.0), vec3(1.0, 0.38, 0.04), smoothstep(0.25, 0.65, heat));
  hot = mix(hot, vec3(1.0, 0.78, 0.38), smoothstep(0.75, 1.0, heat) * mix(1.0, 0.5, uLight));
  vec3 rim = mix(vec3(0.5, 0.05, 0.0), vec3(0.75, 0.25, 0.08), uLight);
  vec3 col = mix(hot, crust, raft);
  col = mix(col, rim, smoothstep(2.5, 0.0, -d) * 0.7);
  vec4 c = vec4(col * inside, inside * mix(0.95, 0.92, uLight));
  c.rgb += hot * heat * deep * inside * mix(0.25, 0.0, uLight);
  return (c + outside) * fade;
}`,
}
