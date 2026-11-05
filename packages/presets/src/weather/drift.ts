import type { Behavior } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

export interface Drift {
  readonly density: number
  readonly wind: number
  readonly fall: number
  readonly gust: number
  readonly size: readonly [min: number, max: number]
  readonly life: readonly [min: number, max: number]
  readonly reach: number
  readonly spin?: number
  readonly streak?: number
  readonly variants?: number
}

/* @__NO_SIDE_EFFECTS__ */
export function drift({ density, wind, fall, gust, size, life, reach, spin = 0, streak = 0, variants = 1 }: Drift): () => Behavior {
  return () => {
    const air = accumulator(8)
    return {
      emit(line, { pool, dt }) {
        for (let n = air(line, line.w * density * 0.01 * dt); n > 0; n--) {
          const i = pool.spawn(line.id)
          if (i < 0) return
          const lifetime = between(...life)
          const pace = between(0.7, 1.3)
          pool.kind[i] = Math.floor(random() * variants)
          pool.x[i] = between(line.x - reach, line.x + line.w + reach) - wind * lifetime * 0.35
          pool.y[i] = between(line.y - reach, line.y + line.h + reach * 0.3) - fall * lifetime * 0.35
          pool.vx[i] = wind * pace
          pool.vy[i] = fall * pace
          pool.life[i] = lifetime
          pool.base[i] = pool.size[i] = between(...size)
          pool.rot[i] = random() * Math.PI * 2
          pool.spin[i] = between(-spin, spin)
        }
      },

      update(i, { pool, dt, time }) {
        const progress = pool.age[i] / pool.life[i]
        const phase = time * 1.6 + pool.seed[i] * 40
        const settle = 1 - Math.exp(-1.5 * dt)
        pool.vx[i] += (wind - pool.vx[i]) * settle + Math.sin(phase + pool.y[i] * 0.02) * gust * dt
        pool.vy[i] += (fall - pool.vy[i]) * settle + Math.cos(phase * 0.7) * gust * 0.5 * dt
        pool.move(i, dt)
        if (streak) {
          const stretch = 1 + Math.hypot(pool.vx[i], pool.vy[i]) * streak
          pool.size[i] = pool.base[i] * stretch
          pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
          pool.params[i * 4] = stretch
        } else pool.rot[i] += pool.spin[i] * dt
        pool.params[i * 4 + 1] = Math.sin(phase * 1.3)
        pool.alpha[i] = envelope(progress, 0.15, 0.65)
        return progress < 1
      },
    }
  }
}
