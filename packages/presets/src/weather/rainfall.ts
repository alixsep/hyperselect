import type { Behavior, Particles } from 'hyperselect'
import { between, clamp01, random } from '../math'
import { accumulator } from '../shared'
import { type Color, tone, vec3 } from './shared'

const DROP = 0
const SPLASH = 1
const PELLET = 2
const RING = 3
const GRAVITY = 1100

export interface Rainfall {
  readonly density: number
  readonly speed: number
  readonly slant: number
  readonly length: number
  readonly splash: number
  readonly pellets?: number
}

function spawn(pool: Particles, line: number, kind: number, x: number, y: number, life: number, base: number): number {
  const i = pool.spawn(line)
  if (i < 0) return i
  pool.kind[i] = kind
  pool.x[i] = x
  pool.y[i] = y
  pool.life[i] = life
  pool.base[i] = pool.size[i] = base
  return i
}

function impact(pool: Particles, line: number, x: number, y: number, droplets: number, size: number): void {
  if (droplets) spawn(pool, line, RING, x, y, between(0.3, 0.5), size)
  for (let n = 0; n < droplets; n++) {
    const i = spawn(pool, line, SPLASH, x + between(-2, 2), y - 1, between(0.25, 0.45), between(2.4, 3.6))
    if (i < 0) return
    pool.vx[i] = between(-75, 75)
    pool.vy[i] = -between(60, 170)
  }
}

/* @__NO_SIDE_EFFECTS__ */
export function rainfall({ density, speed, slant, length, splash, pellets = 0 }: Rainfall): () => Behavior {
  return () => {
    const clouds = accumulator(12)
    return {
      emit(line, { pool, dt }) {
        for (let n = clouds(line, line.w * density * 0.01 * dt); n > 0; n--) {
          const pellet = random() < pellets
          const rise = between(24, 80) * (1 - 0.7 * line.cover)
          const x = between(line.x - 6, line.x + line.w + 6) - slant * (rise + line.h)
          const i = spawn(pool, line.id, pellet ? PELLET : DROP, x, line.y - rise, 3, pellet ? between(4, 7) : length * between(0.7, 1.3))
          if (i < 0) return
          const vy = speed * between(0.85, 1.15) * (pellet ? 0.55 : 1)
          pool.vx[i] = vy * slant
          pool.vy[i] = vy
          pool.rot[i] = Math.atan2(-pool.vx[i], -vy)
          pool.params[i * 4] = pool.base[i] / 2.2
        }
      },

      update(i, { pool, lines, dt }) {
        const line = lines.get(pool.line[i])
        if (!line) return false
        const floor = line.y + line.h + 2
        const kind = pool.kind[i]
        if (kind === DROP) {
          pool.move(i, dt)
          pool.alpha[i] = clamp01(pool.age[i] / 0.08)
          if (pool.y[i] < floor) return true
          impact(pool, pool.line[i], pool.x[i], floor, splash, between(10, 18))
          return false
        }
        const life = pool.age[i] / pool.life[i]
        if (kind === RING) {
          pool.size[i] = pool.base[i] * (0.3 + 0.9 * Math.sqrt(life))
          pool.alpha[i] = (1 - life) ** 2
          return life < 1
        }
        pool.vy[i] += GRAVITY * dt
        pool.move(i, dt)
        if (kind === PELLET && pool.y[i] > floor - pool.base[i] / 2 && pool.vy[i] > 0) {
          if (pool.vy[i] > 120 && splash) impact(pool, pool.line[i], pool.x[i], floor, 1, between(8, 12))
          pool.y[i] = floor - pool.base[i] / 2
          pool.vy[i] *= -0.38
          pool.vx[i] = pool.vx[i] * 0.6 + between(-50, 50)
        }
        pool.alpha[i] = kind === PELLET ? 1 - clamp01((pool.age[i] - 1.1) / 0.4) : 1 - life
        return kind === PELLET ? pool.age[i] < 1.5 : life < 1
      },
    }
  }
}

/* @__NO_SIDE_EFFECTS__ */
export const raindrops = (dark: Color, light: Color, ice: Color = [0.93, 0.97, 1]): string => /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec3 tint = sky(${vec3(dark)}, ${vec3(light)});
  float cover = mix(0.3, 0.92, uLight);
  if (kind < 0.5) {
    float x = p.x * params.x;
    float body = exp(-x * x * 2.2) * smoothstep(-1.0, 0.3, p.y) * smoothstep(1.0, 0.75, p.y);
    float head = exp(-(x * x + pow((p.y - 0.8) * params.x, 2.0)) * 1.4);
    float a = (body * 0.5 + head * 0.7) * alpha;
    return vec4(tint * a * 1.3, a * cover);
  }
  if (kind < 1.5) {
    float a = smoothstep(1.0, 0.35, length(p)) * alpha;
    return vec4(tint * a * 1.3, a * cover);
  }
  if (kind < 2.5) {
    float r = length(p);
    float body = smoothstep(1.0, 0.8, r);
    vec2 l = p - vec2(-0.32, 0.36);
    float spec = exp(-dot(l, l) * 16.0);
    float rim = smoothstep(0.45, 1.0, r);
    vec3 c = mix(${vec3(ice)}, tint, rim * 0.8) * mix(1.0, 0.85, uLight) + spec * 0.8;
    return vec4(c * body * alpha, body * alpha * mix(0.85, 0.95, uLight));
  }
  float ring = abs(length(vec2(p.x, p.y * 3.2)) - 0.8);
  float a = smoothstep(0.22, 0.0, ring) * alpha * 0.8;
  return vec4(tint * a, a * cover);
}`
