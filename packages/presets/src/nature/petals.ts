import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'
import { growth } from './shared'

const blossom = /* glsl */ `
float petal(vec2 p, float len, float wid) {
  float taper = mix(0.32, 1.0, smoothstep(0.0, 0.6, p.y / len));
  vec2 e = vec2(p.x / (wid * taper), (p.y - len * 0.5) / (len * 0.5));
  float d = (length(e) - 1.0) * min(wid * taper, len * 0.5);
  return max(d, wid * 0.36 - length(p - vec2(0.0, len * 1.03)));
}

vec3 petalColor(vec2 p, float len, float wid, float d) {
  float y = clamp(p.y / len, 0.0, 1.0);
  vec3 base = mix(vec3(0.74, 0.3, 0.46), vec3(0.95, 0.6, 0.72), uLight);
  vec3 tip = mix(vec3(0.92, 0.62, 0.72), vec3(1.0, 0.9, 0.93), uLight);
  vec3 col = mix(base, tip, smoothstep(0.0, 0.75, y));
  col *= 0.88 + 0.16 * smoothstep(-wid, wid, p.x);
  col *= 1.0 - 0.12 * smoothstep(0.35, 0.0, abs(p.x)) * smoothstep(0.85, 0.15, y);
  col = mix(col, mix(tip * 1.05, base * 0.92, uLight), smoothstep(-1.2, 0.0, d) * 0.35);
  return col;
}
`

function behavior(): Behavior {
  const drift = accumulator(4)

  return {
    emit(line, { pool, dt }) {
      const open = Math.min(line.w, Math.max(0, line.age * 700 - 60))
      for (let n = drift(line, open * 0.006 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * line.w
        pool.y[i] = line.y + between(-6, line.h * 0.5)
        pool.vx[i] = between(6, 20)
        pool.vy[i] = between(4, 12)
        pool.life[i] = between(2.4, 3.8)
        pool.size[i] = between(6, 8.5)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-1.2, 1.2)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      pool.vx[i] += (Math.sin(time * 1.1 + seed * 23) * 16 - pool.vx[i] * 0.4) * dt
      pool.vy[i] += (22 - pool.vy[i]) * 1.2 * dt
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.alpha[i] = envelope(life, 0.1, 0.65) * 0.92
      return life < 1
    },
  }
}

export const petals: Preset = {
  name: 'petals',
  pad: [14, 12, 12],
  tint: [0.96, 0.62, 0.74],
  selection: { dark: 'color:#fff7fa;text-shadow:0 1px 2px rgb(60 0 25 / .9)', light: 'color:#3a0f20' },
  surface: /* glsl */ `${growth}${blossom}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float band = sdRBox(local, hs, 9.0) + (fbm3(world * 0.05 + seed * 4.0) - 0.5) * 5.0;
  if (band > 12.0) return vec4(0.0);
  vec2 center = world - local;
  vec2 origin = vec2((hash(vec2(seed, 2.0)) - 0.5) * hs.x, 0.0);
  float reveal = smoothstep(10.0, -40.0, length(local - origin) - age * 700.0);
  float blush = fbm3(world * 0.02 + seed);
  vec3 wash = mix(mix(vec3(0.3, 0.08, 0.16), vec3(0.42, 0.14, 0.24), blush), mix(vec3(0.99, 0.87, 0.9), vec3(0.98, 0.78, 0.86), blush), uLight);
  vec4 col = vec4(wash, 1.0) * smoothstep(0.6, -0.6, band) * reveal * mix(0.72, 0.62, uLight);
  vec2 id = floor(world / 24.0);
  float h = hash(id + seed * 3.0);
  vec2 spot = (id + 0.5 + (hash2(id + 1.7) - 0.5) * 0.3) * 24.0;
  if (h < 0.4 || sdRBox(spot - center, hs, 9.0) > -2.0) return col * fade;
  float landed = easeOut((age - length(spot - center - origin) / 700.0 - h * 0.5) / 0.6);
  if (landed <= 0.0) return col * fade;
  float len = 11.0 + 4.0 * hash(id + 3.1);
  float wid = len * 0.42;
  float angle = hash(id + 5.0) * 6.283 + sin(t * 0.6 + h * 30.0) * 0.06 + (1.0 - landed) * (h - 0.5) * 3.0;
  float scale = mix(1.3, 1.0, landed);
  vec2 q = turn(world - spot, angle) / scale + vec2(0.0, len * 0.5);
  vec2 sq = turn(world - spot - vec2(1.0, 1.6) * landed, angle) / scale + vec2(0.0, len * 0.5);
  float shade = smoothstep(1.5, -1.5, petal(sq, len, wid)) * mix(0.35, 0.16, uLight) * landed;
  col.rgb *= 1.0 - shade;
  col.a += shade * (1.0 - col.a);
  float d = petal(q, len, wid);
  float body = smoothstep(0.6, -0.6, d) * landed;
  col = over(col, petalColor(q, len, wid, d), body * mix(0.86, 0.92, uLight));
  return col * fade;
}`,
  sprite: /* glsl */ `${blossom}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float flip = cos(t * 1.4 + seed * 40.0);
  vec2 q = vec2(p.x / max(abs(flip), 0.18), p.y + 1.2);
  float d = petal(q, 2.4, 1.0);
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  vec3 c = petalColor(q, 2.4, 1.0, d / 0.25) * (0.78 + 0.22 * abs(flip));
  c = mix(c, c * mix(1.08, 0.94, uLight), step(flip, 0.0));
  float a = inside * alpha;
  return vec4(c * a, a);
}`,
  behavior,
}
