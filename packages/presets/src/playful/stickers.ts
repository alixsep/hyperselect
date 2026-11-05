import type { Behavior, Line, Particles, Preset } from 'hyperselect'
import { between, clamp01, easeOutBack, random } from '../math'
import { accumulator } from '../shared'
import { festive, tone } from './shared'

const SHAPES = 5
const SLAP = 0.28
const PEEL = 0.45

function place(pool: Particles, line: Line, delay: number): void {
  const i = pool.spawn(line.id)
  if (i < 0) return
  pool.kind[i] = Math.floor(random() * SHAPES)
  pool.x[i] = between(line.x + 8, line.x + line.w - 8)
  pool.y[i] = random() < 0.5 ? line.y + between(-2, 4) : line.y + line.h + between(-4, 2)
  pool.life[i] = between(3.5, 5.5) + delay
  pool.base[i] = between(28, 36)
  pool.size[i] = 0
  pool.rot[i] = between(-0.45, 0.45)
  pool.params[i * 4 + 2] = delay
}

function stickersBehavior(): Behavior {
  const sheet = accumulator(1)
  const started = new WeakSet<Line>()
  return {
    emit(line, { pool, dt }) {
      if (!started.has(line)) {
        started.add(line)
        const count = Math.max(1, Math.min(8, Math.round(line.w / 120)))
        for (let n = 0; n < count; n++) place(pool, line, n * 0.12 + between(0, 0.08))
      }
      for (let n = sheet(line, line.w * 0.0018 * dt); n > 0; n--) place(pool, line, 0)
    },

    update(i, { pool, dt }) {
      const age = pool.age[i] - pool.params[i * 4 + 2]
      const left = pool.life[i] - pool.age[i]
      const slap = clamp01(age / SLAP)
      const peel = clamp01(1 - left / PEEL)
      pool.size[i] = age < 0 ? 0 : pool.base[i] * (1.7 - 0.7 * easeOutBack(slap))
      pool.alpha[i] = clamp01(age / (SLAP * 0.4)) * (1 - peel * peel)
      pool.params[i * 4 + 1] = peel
      if (peel > 0) pool.y[i] -= peel * 30 * dt
      return left > 0
    },
  }
}

export const stickers: Preset = {
  name: 'stickers',
  pad: [26, 28, 28],
  tint: [0.4, 0.72, 0.74],
  selection: { dark: 'color:#f4fbfa', light: 'color:#14262a' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 24.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.15, age);
  float grain = noise(world * 0.9) * 0.5 + noise(world * 0.23) * 0.5;
  vec3 board = sky(mix(vec3(0.08, 0.15, 0.17), vec3(0.1, 0.18, 0.2), grain), mix(vec3(0.86, 0.94, 0.93), vec3(0.9, 0.96, 0.95), grain));
  vec4 c = vec4(board, 1.0) * body * 0.92;
  float residue = smoothstep(0.62, 0.7, noise(world * 0.08 + seed * 9.0)) * smoothstep(0.6, 2.5, age);
  c = over(c, sky(vec3(0.16, 0.25, 0.27), vec3(0.78, 0.87, 0.86)), residue * body * 0.5);
  c = over(c, sky(vec3(0.22, 0.32, 0.34), vec3(0.72, 0.82, 0.81)), stroke(d + 1.5, 0.35) * body * 0.6);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
float flower(vec2 p) {
  float a = atan(p.y, p.x);
  return length(p) - 0.42 - 0.14 * cos(a * 5.0);
}

float rainbowArc(vec2 p) {
  p.y += 0.2;
  return max(abs(length(p) - 0.42) - 0.2, -p.y);
}

float shape(vec2 p, float kind) {
  if (kind < 0.5) return star(p, 0.6, 0.48, 5.0);
  if (kind < 1.5) return heart(p * 1.55) / 1.55;
  if (kind < 2.5) return length(p) - 0.52;
  if (kind < 3.5) return flower(p);
  return rainbowArc(p);
}

vec3 face(vec2 p, float kind, float seed) {
  vec3 base = candy(seed);
  if (kind > 1.5 && kind < 2.5) {
    base = vec3(1.0, 0.82, 0.25);
    vec2 e = vec2(abs(p.x) - 0.17, p.y - 0.12);
    float eyes = 1.0 - smoothstep(0.05, 0.07, length(e * vec2(1.0, 0.7)));
    float mouth = (1.0 - smoothstep(0.03, 0.05, abs(length(p - vec2(0.0, 0.1)) - 0.3))) * step(p.y, -0.02);
    return mix(base, vec3(0.2, 0.12, 0.05), max(eyes, mouth));
  }
  if (kind > 2.5 && kind < 3.5) return mix(base, vec3(1.0, 0.85, 0.3), 1.0 - smoothstep(0.14, 0.17, length(p)));
  if (kind > 3.5) {
    float band = floor(clamp((length(p + vec2(0.0, 0.2)) - 0.22) / 0.4, 0.0, 0.99) * 4.0);
    return band < 0.5 ? vec3(0.35, 0.6, 1.0) : band < 1.5 ? vec3(0.3, 0.82, 0.6) : band < 2.5 ? vec3(1.0, 0.75, 0.2) : vec3(1.0, 0.36, 0.45);
  }
  return base;
}

vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float peel = params.y;
  vec2 n = normalize(vec2(1.0, 1.0));
  float fold = 1.6 - peel * 2.2;
  float side = dot(p, n) - fold;
  vec2 back = p - 2.0 * side * n;
  float cut = shape(p, kind) - 0.12;
  float flap = solid(shape(back, kind) - 0.12) * step(side, 0.0) * step(0.001, peel);
  float front = solid(cut) * step(side, 0.0);
  float shadow = (1.0 - smoothstep(-0.05, 0.12, shape(p - vec2(0.04, -0.07), kind) - 0.12)) * step(side, 0.0) * 0.35;
  float ink = solid(shape(p, kind));
  vec3 c = mix(vec3(1.0), face(p, kind, seed), ink);
  c *= 0.92 + 0.08 * smoothstep(-0.6, 0.6, p.y);
  float shine = smoothstep(0.03, 0.0, abs(dot(p, vec2(0.6, -0.8)) - 0.25 + p.x * 0.1)) * ink * 0.25;
  c += shine;
  vec3 paper = mix(vec3(0.82, 0.83, 0.85), vec3(0.97), smoothstep(0.0, -0.5, side));
  vec4 o = vec4(vec3(0.0), shadow * (1.0 - front));
  o = vec4(mix(o.rgb, c, front), max(o.a, front));
  o = vec4(mix(o.rgb, paper, flap), max(o.a, flap));
  return o * alpha;
}`,
  behavior: stickersBehavior,
}
