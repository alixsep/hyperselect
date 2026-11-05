import type { Behavior, Line, Particles, Preset } from 'hyperselect'
import { between, envelope, shaderHash } from '../math'
import { accumulator } from '../shared'

function firefly(pool: Particles, line: Line): void {
  const i = pool.spawn(line.id)
  if (i < 0) return
  pool.x[i] = line.x + between(-10, line.w + 10)
  pool.y[i] = line.y + between(-8, line.h + 8)
  pool.life[i] = between(3.5, 7)
  pool.size[i] = between(16, 26)
}

function behavior(): Behavior {
  const swarm = accumulator(12)
  const gathered = new WeakSet<Line>()

  return {
    emit(line, { pool, dt }) {
      if (!gathered.has(line)) {
        gathered.add(line)
        for (let n = Math.round(4 + line.w * 0.025); n > 0; n--) firefly(pool, line)
        return
      }
      for (let n = swarm(line, line.w * 0.007 * dt); n > 0; n--) firefly(pool, line)
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 0.8)
      const seed = pool.seed[i]
      const follow = Math.min(1, dt * 1.5)
      pool.vx[i] += (Math.sin(time * 0.7 + seed * 20) * 14 + Math.sin(time * 1.9 + seed * 9) * 6 - pool.vx[i]) * follow
      pool.vy[i] += (Math.cos(time * 0.6 + seed * 31) * 9 + Math.sin(time * 1.4 + seed * 5) * 4 - pool.vy[i]) * follow
      pool.move(i, dt)
      const life = pool.age[i] / pool.life[i]
      const glow = 0.5 + 0.5 * Math.sin(time * (1.2 + 1.6 * shaderHash(seed, 3)) + seed * 40)
      pool.alpha[i] = envelope(life, 0.05, 0.75) * (0.15 + 0.85 * glow * glow)
      return life < 1
    },
  }
}

export const fireflies: Preset = {
  name: 'fireflies',
  pad: [16, 12, 12],
  tint: [0.78, 0.95, 0.28],
  selection: { dark: 'color:#f6fbe6', light: 'color:#1f2a06' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 8.0);
  if (d > 12.0) return vec4(0.0);
  float dusk = smoothstep(10.0, -4.0, d) * smoothstep(0.0, 0.5, age);
  float pocket = smoothstep(0.45, 0.8, fbm3(world * 0.018 + vec2(t * 0.05, -t * 0.03) + seed * 4.0));
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.84, 0.9, 0.74), 1.0) * dusk * 0.55;
    c = over(c, vec3(0.88, 0.94, 0.55), pocket * dusk * 0.4);
    return c * fade;
  }
  vec3 rgb = vec3(0.01, 0.035, 0.03) * dusk + vec3(0.32, 0.45, 0.08) * pocket * dusk * 0.12;
  return vec4(rgb * fade, dusk * 0.55 * fade);
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r = length(p);
  float core = smoothstep(0.17, 0.07, r);
  float glow = exp(-r * r * 9.0) * 0.8 + exp(-r * 3.5) * 0.25;
  if (uLight > 0.5) {
    float a = clamp(glow * 1.1 + core, 0.0, 1.0) * alpha;
    vec3 c = mix(vec3(0.95, 0.84, 0.3), vec3(0.5, 0.56, 0.02), core);
    return vec4(c * a, a);
  }
  vec3 c = vec3(1.0, 1.0, 0.78) * core + vec3(0.7, 1.0, 0.22) * glow;
  return vec4(c * alpha, 0.0);
}`,
  behavior,
}
