import type { Behavior, Preset } from 'hyperselect'
import { between, clamp01, smooth } from '../math'
import { accumulator } from '../shared'
import { atmosphere, tone } from './shared'

const SPACING = 9
const HANG = 0.7

const growth = (age: number): number => smooth(clamp01((age - 0.2) / 2.8))
const reach = (id: number, seed: number): number => (0.5 + 0.5 * Math.sin(id * 2.399 + seed * 20)) ** 2

function behavior(): Behavior {
  const melt = accumulator(2)
  return {
    emit(line, { pool, dt }) {
      const grown = growth(line.age)
      for (let n = melt(line, line.w * 0.006 * grown * dt); n > 0; n--) {
        const id = Math.floor(between(line.x + 6, line.x + line.w - 6) / SPACING)
        const length = grown * (4 + 12 * reach(id, line.seed))
        if (length < 7) continue
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = (id + 0.5) * SPACING
        pool.y[i] = line.y + line.h + length - 0.5
        pool.life[i] = HANG + 0.6
        pool.base[i] = between(3.5, 5)
      }
    },

    update(i, { pool, dt }) {
      const age = pool.age[i]
      if (age < HANG) {
        pool.size[i] = pool.base[i] * (0.3 + 0.7 * smooth(age / HANG))
        pool.alpha[i] = 1
        return true
      }
      pool.vy[i] += 900 * dt
      pool.move(i, dt)
      pool.params[i * 4] = Math.min(1 + pool.vy[i] / 220, 2.5)
      pool.alpha[i] = 1 - clamp01((age - HANG - 0.25) / 0.35)
      return age < pool.life[i]
    },
  }
}

export const icicles: Preset = {
  name: 'icicles',
  pad: [16, 18, 34],
  tint: [0.62, 0.84, 0.98],
  selection: { dark: 'color:#f2fbff', light: 'color:#10202c' },
  surface: /* glsl */ `${atmosphere}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 1.0);
  float d = sdRBox(local, hs, 4.0);
  if (fade < 0.001 || d > 34.0) return vec4(0.0);
  float open = smoothstep(0.0, 0.4, age);
  float body = solid(d) * open;
  float frost = fbm(world * 0.09 + seed * 6.0);
  vec3 ice = sky(mix(vec3(0.05, 0.13, 0.2), vec3(0.1, 0.22, 0.32), frost), mix(vec3(0.8, 0.91, 0.97), vec3(0.9, 0.96, 1.0), frost));
  vec4 c = vec4(ice, 1.0) * body * 0.9;
  float sheen = pow(0.5 + 0.5 * sin((world.x + world.y * 2.5) * 0.035 + frost * 3.0 - t * 0.4), 10.0);
  c = over(c, sky(vec3(0.5, 0.75, 0.9), vec3(1.0)), sheen * body * 0.25);
  float rime = solid(local.y + hs.y - 2.0 - noise(vec2(world.x * 0.3, seed)) * 1.5) * body;
  c = over(c, sky(vec3(0.85, 0.95, 1.0), vec3(1.0)), rime * 0.9);
  float grown = smoothstep(0.2, 3.0, age);
  float id = floor(world.x / ${SPACING}.0);
  float reach = pow(0.5 + 0.5 * sin(id * 2.399 + seed * 20.0), 2.0);
  float len = grown * (4.0 + 12.0 * reach);
  float y = local.y - hs.y + 1.5;
  float x = mod(world.x, ${SPACING}.0) - ${SPACING / 2};
  float width = 2.6 * (0.7 + 0.3 * reach) * pow(clamp(1.0 - y / max(len, 0.001), 0.0, 1.0), 1.3);
  float spike = solid(abs(x) - width) * step(0.0, y) * step(abs(local.x), hs.x - 3.0) * open;
  float shine = smoothstep(width, -width, x + width * 0.45) * smoothstep(-width * 0.9, -width * 0.2, x);
  vec3 spikeColor = mix(sky(vec3(0.42, 0.7, 0.9), vec3(0.55, 0.78, 0.92)), vec3(0.97, 1.0, 1.0), shine * 0.85);
  c = over(c, spikeColor, spike * mix(0.75, 0.9, shine));
  return c * uncovered(hs, cover) * smoothstep(0.0, 0.7, fade);
}`,
  sprite: /* glsl */ `${tone}
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = vec2(p.x * params.x, p.y + 0.15);
  float r = length(q) + max(q.y, 0.0) * 0.6;
  float drop = smoothstep(0.9, 0.7, r);
  vec2 s = q - vec2(-0.25, -0.2);
  float spec = exp(-dot(s, s) * 30.0);
  vec3 c = sky(vec3(0.55, 0.82, 1.0), vec3(0.35, 0.6, 0.8)) * mix(0.6, 1.0, smoothstep(0.3, 0.8, r)) + spec;
  return vec4(c * drop * alpha, drop * alpha * mix(0.6, 0.9, uLight));
}`,
  behavior,
}
