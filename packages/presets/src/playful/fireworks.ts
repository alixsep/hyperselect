import type { Behavior, Particles, Preset } from 'hyperselect'
import { between, clamp01, random } from '../math'
import { accumulator } from '../shared'
import { festive, tone } from './shared'

const ROCKET = 0
const SPARK = 1

function burst(pool: Particles, line: number, x: number, y: number, hue: number): void {
  const count = Math.round(between(18, 26))
  const speed = between(120, 170)
  for (let n = 0; n < count; n++) {
    const i = pool.spawn(line)
    if (i < 0) return
    const angle = (n / count) * Math.PI * 2 + between(-0.08, 0.08)
    const v = speed * between(0.85, 1.05)
    pool.kind[i] = SPARK
    pool.x[i] = x
    pool.y[i] = y
    pool.vx[i] = Math.cos(angle) * v
    pool.vy[i] = Math.sin(angle) * v
    pool.life[i] = between(0.9, 1.3)
    pool.base[i] = pool.size[i] = 5
    pool.params[i * 4 + 2] = random() < 0.2 ? (hue + 0.4) % 1 : hue
  }
}

function fireworksBehavior(): Behavior {
  const launches = accumulator(2)
  return {
    emit(line, { pool, dt }) {
      for (let n = launches(line, Math.max(0.7, line.w * 0.004) * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.kind[i] = ROCKET
        pool.x[i] = between(line.x + 10, line.x + line.w - 10)
        pool.y[i] = line.y + line.h * 0.6
        pool.vx[i] = between(-20, 20)
        pool.vy[i] = -between(260, 330)
        pool.life[i] = between(0.32, 0.42)
        pool.base[i] = pool.size[i] = 8
        pool.params[i * 4 + 2] = random()
      }
    },

    update(i, { pool, dt }) {
      const progress = pool.age[i] / pool.life[i]
      if (pool.kind[i] === ROCKET) {
        pool.vy[i] += 380 * dt
        pool.move(i, dt)
        pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
        pool.alpha[i] = clamp01(pool.age[i] / 0.05)
        if (progress < 1) return true
        burst(pool, pool.line[i], pool.x[i], pool.y[i], pool.params[i * 4 + 2])
        return false
      }
      const k = 1 - 2.6 * dt
      pool.vx[i] *= k
      pool.vy[i] = pool.vy[i] * k + 90 * dt
      pool.move(i, dt)
      const speed = Math.hypot(pool.vx[i], pool.vy[i])
      const stretch = 1 + speed * 0.03
      pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
      pool.size[i] = pool.base[i] * stretch
      pool.params[i * 4] = stretch
      pool.params[i * 4 + 1] = Math.sin(pool.age[i] * 40 + pool.seed[i] * 30)
      pool.alpha[i] = (1 - progress) ** 1.5
      return progress < 1
    },
  }
}

export const fireworks: Preset = {
  name: 'fireworks',
  pad: [28, 50, 18],
  tint: [0.95, 0.6, 0.35],
  selection: { dark: 'color:#fff8ef', light: 'color:#1c1426' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 10.0));
  if (fade < 0.001 || d > 30.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  float depth = smoothstep(-hs.y, hs.y, local.y);
  vec4 c = vec4(sky(mix(vec3(0.04, 0.03, 0.12), vec3(0.13, 0.06, 0.16), depth), mix(vec3(0.86, 0.84, 0.97), vec3(0.98, 0.9, 0.9), depth)), 1.0) * body * 0.92;
  float smoke = fbm3(vec2(world.x * 0.03 + t * 0.05, world.y * 0.06 - t * 0.08) + seed * 4.0);
  c = over(c, sky(vec3(0.3, 0.2, 0.35), vec3(0.75, 0.7, 0.88)), smoothstep(0.45, 0.8, smoke) * body * 0.3);
  vec2 g = world / 7.0 + seed * 13.0;
  vec2 id = floor(g);
  float star = exp(-dot(fract(g) - 0.5, fract(g) - 0.5) * 120.0) * step(0.9, hash(id)) * (0.5 + 0.5 * sin(t * 3.0 + hash(id + 1.0) * 30.0));
  c = over(c, sky(vec3(1.0, 0.95, 0.85), vec3(0.45, 0.4, 0.6)), star * body * (1.0 - depth) * 0.7);
  c += vec4(sky(vec3(0.5, 0.25, 0.1), vec3(0.0)), 0.0) * exp(-abs(local.y - hs.y) / 2.0) * body * 0.4;
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float cover = mix(0.4, 0.95, uLight);
  if (kind < 0.5) {
    float x = p.x * 6.0;
    float trail = exp(-x * x) * smoothstep(-1.0, 0.6, p.y) * smoothstep(1.0, 0.8, p.y);
    float head = exp(-(x * x + pow((p.y - 0.75) * 6.0, 2.0)) * 0.6);
    vec3 c = sky(vec3(1.0, 0.85, 0.55), vec3(0.85, 0.45, 0.12));
    float a = (trail * 0.5 + head) * alpha;
    return vec4((c + head * 0.4) * a, a * cover);
  }
  float x = p.x * params.x * 1.6;
  float tail = exp(-x * x * 1.4) * smoothstep(-1.0, 0.5, p.y);
  float head = exp(-(x * x + pow((p.y - 0.7) * params.x, 2.0)) * 1.2);
  float flicker = mix(0.75, 1.0, params.y * 0.5 + 0.5);
  vec3 hue = candy(params.z);
  vec3 c = sky(mix(hue, vec3(1.0), head * 0.6) * 1.3, hue * 0.75);
  float a = (tail * 0.6 + head) * alpha * flicker;
  return vec4(c * a, a * cover);
}`,
  behavior: fireworksBehavior,
}
