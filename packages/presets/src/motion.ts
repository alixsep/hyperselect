import type { Behavior, Line } from 'hyperselect'
import { between, envelope, random } from './math'
import { accumulator } from './shared'

type Range = readonly [min: number, max: number]

export interface Toss {
  readonly burst: number
  readonly rate: number
  readonly speed: Range
  readonly spread: number
  readonly gravity: number
  readonly drag: number
  readonly size: Range
  readonly life: Range
  readonly spin?: number
  readonly flutter?: number
  readonly bounce?: number
  readonly variants?: number
}

/* @__NO_SIDE_EFFECTS__ */
export function toss({ burst, rate, speed, spread, gravity, drag, size, life, spin = 0, flutter = 0, bounce, variants = 1 }: Toss): () => Behavior {
  return () => {
    const steady = accumulator(6)
    const thrown = new WeakSet<Line>()
    return {
      emit(line, { pool, dt }) {
        let count = steady(line, line.w * rate * 0.01 * dt)
        if (!thrown.has(line)) {
          thrown.add(line)
          count += Math.round(Math.min(80, line.w * burst * 0.01))
        }
        for (; count > 0; count--) {
          const i = pool.spawn(line.id)
          if (i < 0) return
          const angle = -Math.PI / 2 + between(-spread, spread)
          const v = between(...speed)
          pool.kind[i] = Math.floor(random() * variants)
          pool.x[i] = between(line.x, line.x + line.w)
          pool.y[i] = line.y + line.h * between(0.2, 0.9)
          pool.vx[i] = Math.cos(angle) * v
          pool.vy[i] = Math.sin(angle) * v
          pool.life[i] = between(...life)
          pool.base[i] = pool.size[i] = between(...size)
          pool.rot[i] = random() * Math.PI * 2
          pool.spin[i] = between(-spin, spin)
        }
      },

      update(i, { pool, lines, dt, time }) {
        const progress = pool.age[i] / pool.life[i]
        const phase = time * 7 + pool.seed[i] * 60
        pool.vy[i] += gravity * dt
        pool.vx[i] += Math.sin(phase * 0.4) * flutter * dt
        const k = 1 - drag * dt
        pool.vx[i] *= k
        pool.vy[i] *= k
        pool.move(i, dt)
        if (bounce !== undefined) {
          const line = lines.get(pool.line[i])
          const floor = line ? line.y + line.h - pool.base[i] * 0.4 : Infinity
          if (pool.vy[i] > 0 && pool.y[i] > floor) {
            pool.y[i] = floor
            pool.vy[i] *= -bounce
            pool.vx[i] *= 0.6
            pool.spin[i] *= 0.5
          }
        }
        pool.rot[i] += pool.spin[i] * dt
        pool.params[i * 4 + 1] = Math.cos(phase)
        pool.alpha[i] = envelope(progress, 0.04, 0.8)
        return progress < 1
      },
    }
  }
}

export interface Rise {
  readonly rate: number
  readonly speed: Range
  readonly wobble: number
  readonly size: Range
  readonly life: Range
  readonly variants?: number
}

/* @__NO_SIDE_EFFECTS__ */
export function rise({ rate, speed, wobble, size, life, variants = 1 }: Rise): () => Behavior {
  return () => {
    const steady = accumulator(4)
    return {
      emit(line, { pool, dt }) {
        for (let n = steady(line, line.w * rate * 0.01 * dt); n > 0; n--) {
          const i = pool.spawn(line.id)
          if (i < 0) return
          pool.kind[i] = Math.floor(random() * variants)
          pool.x[i] = between(line.x, line.x + line.w)
          pool.y[i] = line.y + line.h * between(0.3, 1)
          pool.vy[i] = -between(...speed)
          pool.life[i] = between(...life)
          pool.base[i] = pool.size[i] = between(...size)
        }
      },

      update(i, { pool, dt, time }) {
        const progress = pool.age[i] / pool.life[i]
        const phase = time * 2.2 + pool.seed[i] * 40
        pool.vx[i] = Math.sin(phase) * wobble
        pool.move(i, dt)
        pool.rot[i] = Math.sin(phase - 0.6) * 0.25
        pool.size[i] = pool.base[i] * Math.min(1, progress * 8)
        pool.params[i * 4 + 1] = Math.sin(phase * 1.7)
        pool.alpha[i] = envelope(progress, 0.08, 0.85)
        return progress < 1
      },
    }
  }
}
