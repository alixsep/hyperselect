import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const vapor = accumulator(10)

  return {
    emit(line, { pool, lines, dt }) {
      if (line.age < 0.25) return
      for (let n = vapor(line, line.w * 0.03 * dt); n > 0; n--) {
        const x = line.x + random() * line.w
        if (lines.edgeCovered(line, true, x)) continue
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = x
        pool.y[i] = line.y - between(4, 12)
        pool.vx[i] = between(-5, 5)
        pool.vy[i] = between(-80, -50)
        pool.life[i] = between(0.9, 1.5)
        pool.base[i] = between(28, 46)
        pool.rot[i] = between(-0.15, 0.15)
      }
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 0.5)
      const life = pool.age[i] / pool.life[i]
      pool.vy[i] *= 1 - 0.9 * dt
      pool.vx[i] += Math.sin(time * 1.7 + pool.seed[i] * 13) * 30 * dt
      pool.move(i, dt)
      pool.size[i] = pool.base[i] * (0.8 + 1.1 * life)
      pool.alpha[i] = envelope(life, 0.2, 0.35)
      return life < 1
    },
  }
}

export const steam: Preset = {
  name: 'steam',
  pad: [10, 8, 8],
  tint: [0.62, 0.84, 0.92],
  selection: { dark: 'color:#f6fbfc;text-shadow:0 1px 2px rgb(10 30 40 / .8)', light: 'color:#0b2630' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float d = sdRBox(local, hs, 6.0) + (noise(world * 0.12 + seed * 4.0) - 0.5) * 3.0;
  float body = smoothstep(2.0, -4.0, d);
  float fogged = smoothstep(0.0, 70.0, age * 700.0 - (local.x + hs.x));
  if (body * fogged <= 0.0) return vec4(0.0);
  float film = fbm3(world * vec2(0.025, 0.05) + vec2(0.0, t * 0.2) + seed * 5.0);
  float fog = body * fogged * (0.06 + 0.3 * smoothstep(0.3, 0.75, film) + 0.14 * smoothstep(hs.y, -hs.y, local.y));
  float col = floor(world.x / 22.0);
  float h = hash(vec2(col, seed * 9.0 + 1.0));
  float run = clamp((age - 0.8 - 1.2 * hash(vec2(col, 4.0))) * (12.0 + 18.0 * h), 0.0, 2.0 * hs.y + 4.0);
  float down = local.y + hs.y;
  float x0 = (col + 0.25 + 0.5 * hash(vec2(col, 7.0))) * 22.0 + (noise(vec2(col * 3.0, world.y * 0.15)) - 0.5) * 3.0;
  float dx = abs(world.x - x0);
  float running = step(h, 0.35) * step(down, run) * body;
  float trail = smoothstep(1.6, 0.4, dx) * running;
  float bead = smoothstep(2.6, 1.6, length(vec2(world.x - x0, down - run))) * step(h, 0.35) * step(1.0, run) * body;
  fog *= 1.0 - trail * 0.8;
  vec3 vapor = mix(vec3(0.88, 0.95, 1.0), vec3(0.58, 0.7, 0.77), uLight);
  vec4 c = vec4(vapor * fog, fog);
  c = over(c, mix(vec3(0.95, 1.0, 1.0), vec3(0.4, 0.52, 0.6), uLight), trail * smoothstep(0.4, 1.4, dx) * 0.5);
  c = over(c, mix(vec3(0.97, 1.0, 1.0), vec3(0.42, 0.55, 0.63), uLight), bead * 0.85);
  return c * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = vec2(p.x * 2.2, p.y);
  float n = fbm(vec2(q.x * 0.9, q.y * 1.4 + t * 1.6) + seed * 17.0);
  float curl = sin(p.y * (3.0 + 2.0 * seed) + seed * 30.0 + t * 2.5) * (0.1 + 0.2 * (1.0 + p.y));
  float w = (p.x - curl) * (2.6 - 1.4 * life);
  float strand = exp(-w * w);
  float span = smoothstep(1.0, 0.3, p.y) * smoothstep(-1.0, -0.2, p.y);
  float a = strand * span * smoothstep(0.15, 0.75, n) * alpha * mix(0.5, 0.55, uLight);
  vec3 c = mix(vec3(0.92, 0.97, 1.0), vec3(0.6, 0.71, 0.78), uLight);
  return vec4(c * a, a);
}`,
  behavior,
}
