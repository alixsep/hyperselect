import type { Behavior, Line, Preset } from 'hyperselect'
import { between, random } from '../math'
import { accumulator } from '../shared'
import { festive, tone } from './shared'

const SWEEP = 90

const head = (line: Line): number => line.w * (0.5 - 0.5 * Math.cos((line.age * SWEEP * Math.PI) / Math.max(line.w, 1)))

function sparklerBehavior(): Behavior {
  const steady = accumulator(10)
  return {
    emit(line, { pool, dt }) {
      for (let n = steady(line, 110 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        const angle = -Math.PI / 2 + between(-1.5, 1.5)
        const v = between(70, 230)
        pool.kind[i] = random() < 0.15 ? 1 : 0
        pool.x[i] = line.x + head(line)
        pool.y[i] = line.y + line.h + 1
        pool.vx[i] = Math.cos(angle) * v
        pool.vy[i] = Math.sin(angle) * v
        pool.life[i] = between(0.16, 0.42)
        pool.base[i] = pool.size[i] = between(5, 8)
      }
    },

    update(i, { pool, dt }) {
      const progress = pool.age[i] / pool.life[i]
      const k = 1 - 3 * dt
      pool.vx[i] *= k
      pool.vy[i] = pool.vy[i] * k + 240 * dt
      pool.move(i, dt)
      const stretch = 1 + Math.hypot(pool.vx[i], pool.vy[i]) * 0.025
      pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
      pool.size[i] = pool.base[i] * stretch
      pool.params[i * 4] = stretch
      pool.alpha[i] = 1 - progress * progress
      return progress < 1
    },
  }
}

export const sparkler: Preset = {
  name: 'sparkler',
  pad: [22, 14, 18],
  tint: [1.0, 0.8, 0.45],
  selection: { dark: 'color:#fffaf0;text-shadow:0 1px 2px rgb(14 6 0 / .7)', light: 'color:#24160a' },
  surface: /* glsl */ `${festive}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 6.0);
  if (fade < 0.001 || d > 14.0) return vec4(0.0);
  float body = solid(d) * smoothstep(0.0, 0.2, age);
  vec4 c = vec4(sky(vec3(0.06, 0.045, 0.04), vec3(0.99, 0.96, 0.91)), 1.0) * body * 0.92;
  float x = -halfSize.x + halfSize.x * 2.0 * (0.5 - 0.5 * cos(age * ${SWEEP}.0 * PI / max(halfSize.x * 2.0, 1.0)));
  vec2 p = local - vec2(x, halfSize.y + 1.0);
  float fizz = 0.85 + 0.15 * noise(vec2(t * 30.0, seed));
  float trail = exp(-abs(p.x) / 26.0) * exp(-abs(local.y - hs.y) / 1.6);
  float core = exp(-length(p) / 2.2) * fizz;
  float halo = exp(-length(p * vec2(0.7, 1.0)) / 14.0) * fizz;
  c.rgb += vec3(1.0, 0.62, 0.25) * (halo * 0.35 + trail * 0.5) * (1.0 - uLight);
  c = over(c, vec3(1.0, 0.55, 0.15), (halo * 0.22 + trail * 0.5) * uLight * body);
  c = over(c, sky(vec3(1.0, 0.97, 0.86), vec3(1.0, 0.82, 0.45)), clamp(core, 0.0, 1.0));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec3 hot = sky(vec3(1.0, 0.86, 0.55), vec3(0.95, 0.5, 0.1));
  float cover = mix(0.3, 0.95, uLight);
  if (kind > 0.5) {
    float g = clamp(glint(p, 0.8), 0.0, 1.0) * alpha;
    return vec4(mix(hot, vec3(1.0), 0.5) * g, g * cover);
  }
  float x = p.x * params.x * 1.8;
  float tail = exp(-x * x * 1.5) * smoothstep(-1.0, 0.6, p.y);
  float tip = exp(-(x * x + pow((p.y - 0.75) * params.x, 2.0)) * 1.3);
  float a = (tail * 0.55 + tip) * alpha;
  return vec4(mix(hot, vec3(1.0), tip * 0.6) * a, a * cover);
}`,
  behavior: sparklerBehavior,
}
