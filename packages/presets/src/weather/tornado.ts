import type { Behavior, Line, Preset } from 'hyperselect'
import { between, clamp01, envelope, random } from '../math'
import { accumulator } from '../shared'
import { atmosphere, tone } from './shared'

const track = (line: Line, time: number): number =>
  line.x + line.w / 2 + Math.sin(time * 0.38 + line.seed * 6) * Math.max(line.w / 2 - 25, 0)

function behavior(): Behavior {
  const debris = accumulator(6)
  return {
    emit(line, { pool, dt }) {
      for (let n = debris(line, 26 * clamp01(line.age / 0.7) * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.y[i] = line.y + line.h + between(0, 8)
        pool.vy[i] = -between(20, 55)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-9, 9)
        pool.params[i * 4 + 1] = random() * Math.PI * 2
        pool.life[i] = between(1.4, 2.6)
        pool.base[i] = pool.size[i] = between(3, 7)
      }
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line) return false
      const progress = pool.age[i] / pool.life[i]
      pool.y[i] += pool.vy[i] * dt
      const height = clamp01((line.y + line.h + 9 - pool.y[i]) / (line.h + 32))
      const angle = (pool.params[i * 4 + 1] += dt * (6 - 3 * height))
      const radius = 10 + Math.min(25, (line.w / 2 + 5) * 0.35) * height ** 1.7
      pool.x[i] = track(line, time) + Math.cos(angle) * radius
      pool.rot[i] += pool.spin[i] * dt
      pool.params[i * 4 + 2] = Math.sin(angle)
      pool.alpha[i] = envelope(progress, 0.1, 0.7) * (0.55 + 0.45 * Math.sin(angle))
      return progress < 1
    },
  }
}

export const tornado: Preset = {
  name: 'tornado',
  pad: [30, 34, 22],
  tint: [0.55, 0.65, 0.72],
  selection: { dark: 'color:#f3f6f8;text-shadow:0 0 8px rgb(10 14 18 / .9)', light: 'color:#171d22' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 1.0);
  if (fade < 0.001 || abs(local.x) > hs.x + 30.0 || abs(local.y) > hs.y + 34.0) return vec4(0.0);
  float grow = smoothstep(0.05, 0.9, age);
  float track = sin(t * 0.38 + seed * 6.0) * max(hs.x - 30.0, 0.0);
  float wash = (1.0 - smoothstep(-4.0, 8.0, sdRBox(local, hs, 8.0))) * smoothstep(0.0, 0.2, age);
  float gloom = fbm3(vec2(world.x * 0.02 - t * 0.3, world.y * 0.06) + seed * 3.0);
  vec4 c = vec4(sky(mix(vec3(0.11, 0.14, 0.16), vec3(0.19, 0.22, 0.23), gloom), mix(vec3(0.74, 0.79, 0.78), vec3(0.84, 0.87, 0.85), gloom)), 1.0) * wash * 0.9;
  float height = hs.y * 2.0 + 32.0;
  float y = clamp((hs.y + 9.0 - local.y) / height, 0.0, 1.0);
  float width = (2.5 + min(25.0, hs.x * 0.35) * pow(y, 1.7)) * grow;
  float bend = sin(y * 3.8 + t * 1.2) * 6.0 * y;
  vec2 q = vec2(local.x - track - bend, local.y);
  float x = q.x / max(width, 1.0);
  float edge = abs(q.x) - width - (noise(vec2(local.y * 0.3, t * 6.0)) - 0.5) * 3.0 * y;
  float funnel = (1.0 - smoothstep(-1.5, 1.5, edge)) * step(local.y, hs.y + 9.0);
  float turn = asin(clamp(x, -1.0, 1.0));
  float bands = fbm3(vec2(turn * 1.6 - t * 5.0, y * 9.0 + seed));
  float rounded = sqrt(max(1.0 - x * x, 0.0));
  vec3 vortex = sky(vec3(0.2, 0.25, 0.28), vec3(0.42, 0.47, 0.5)) * (0.55 + 0.6 * rounded) + sky(vec3(0.22, 0.24, 0.24), vec3(0.18, 0.18, 0.17)) * bands;
  c = over(c, vortex, funnel * 0.95);
  vec2 base = vec2((local.x - track) / (30.0 + 8.0 * sin(t * 2.0)), (local.y - hs.y - 6.0) / 7.0);
  float dust = smoothstep(1.0, 0.2, length(base) + (fbm3(base * 2.0 + vec2(t * 3.0, 0.0)) - 0.5) * 0.8) * grow;
  c = over(c, sky(vec3(0.42, 0.37, 0.29), vec3(0.62, 0.56, 0.45)), dust * 0.75);
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float shape = length(p * vec2(1.0, 0.6 + seed)) + (noise(p * 3.0 + seed * 40.0) - 0.5) * 0.6;
  float chip = smoothstep(0.85, 0.65, shape);
  vec3 c = sky(mix(vec3(0.3, 0.26, 0.2), vec3(0.45, 0.4, 0.33), seed), mix(vec3(0.22, 0.2, 0.16), vec3(0.36, 0.3, 0.22), seed));
  return vec4(c * chip * alpha, chip * alpha);
}`,
  behavior,
}
