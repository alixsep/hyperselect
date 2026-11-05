import type { Behavior, Preset } from 'hyperselect'
import { between, clamp01, smooth } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const spit = accumulator(10)

  return {
    emit(line, { pool, dt }) {
      const run = line.age * 380
      const x = line.x - 16 + Math.min(run, line.w + 22)
      const y = line.y + line.h / 2
      for (let n = spit(line, (run < line.w + 22 ? 70 : 24) * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        const angle = between(-Math.PI, 0)
        const speed = between(60, 220)
        pool.x[i] = x
        pool.y[i] = y
        pool.vx[i] = Math.cos(angle) * speed
        pool.vy[i] = Math.sin(angle) * speed
        pool.life[i] = between(0.3, 0.75)
        pool.base[i] = between(2.4, 3.8)
      }
    },

    update(i, { pool, dt }) {
      const life = pool.age[i] / pool.life[i]
      pool.vy[i] += 520 * dt
      pool.vx[i] *= 1 - 1.8 * dt
      pool.vy[i] *= 1 - 1.8 * dt
      pool.move(i, dt)
      const stretch = Math.min(1 + Math.hypot(pool.vx[i], pool.vy[i]) / 60, 5)
      pool.size[i] = pool.base[i] * stretch
      pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
      pool.params[i * 4] = stretch
      pool.alpha[i] = 1 - smooth(clamp01((life - 0.4) / 0.6))
      return life < 1
    },
  }
}

export const flare: Preset = {
  name: 'flare',
  pad: [30, 34, 22],
  tint: [1, 0.2, 0.3],
  selection: { dark: 'color:#fff3f4;text-shadow:0 1px 3px rgb(60 0 8 / .95)', light: 'color:#33000a' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float head = -hs.x - 10.0 + min(age * 380.0, 2.0 * hs.x + 10.0);
  float d = sdRBox(local, hs, min(hs.y, 10.0));
  float burned = smoothstep(4.0, -24.0, local.x - head);
  float aa = fwidth(d);
  float body = smoothstep(aa, -aa, d) * burned;
  float flick = 0.86 + 0.14 * noise(vec2(world.x * 0.04, t * 2.5 + seed * 5.0));
  float core = exp(-abs(local.y) / (hs.y * 0.55)) * body;
  float halo = exp(-max(d, 0.0) / 13.0) * (1.0 - body) * burned;
  vec2 hd = vec2(local.x - head, local.y * 1.4);
  float spark = 0.85 + 0.15 * noise(vec2(t * 18.0, seed * 11.0));
  float orb = exp(-length(hd) / 5.0) * spark;
  float bloom = exp(-length(hd) / 22.0) * spark;
  float above = -hs.y - local.y;
  float haze = 0.0;
  if (above > 0.0 && cover < 1.0) {
    haze = smoothstep(0.4, 0.8, fbm3(vec2(world.x * 0.025, world.y * 0.03 + t * 0.7) + seed * 4.0)) * exp(-above / 14.0) * burned * 0.35;
  }
  vec3 crimson = vec3(0.55, 0.02, 0.08), red = vec3(1.0, 0.16, 0.24), rose = vec3(1.0, 0.62, 0.62);
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(1.0, 0.55, 0.6), 1.0) * clamp(halo * 0.35 + bloom * 0.5 + haze * 0.5, 0.0, 1.0);
    c = over(c, mix(vec3(1.0, 0.82, 0.84), vec3(0.95, 0.38, 0.45), core * flick), body * 0.88);
    c = over(c, vec3(1.0, 0.93, 0.92), clamp(orb, 0.0, 1.0));
    return c * fade;
  }
  vec3 band = mix(crimson, red, smoothstep(0.1, 0.7, core * flick));
  band = mix(band, rose, smoothstep(0.75, 1.0, core * flick) * 0.6);
  vec3 rgb = band * body * 0.85 + red * halo * 0.4 * flick + vec3(0.5, 0.12, 0.15) * haze + rose * bloom * 0.5 + vec3(1.0, 0.95, 0.95) * orb * 1.4;
  return vec4(rgb, body * 0.8 + haze * 0.4) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = vec2(p.x * params.x, p.y);
  float r2 = dot(q, q);
  float core = exp(-r2 * 8.0), halo = exp(-r2 * 2.0) * 0.35;
  vec3 c = mix(vec3(1.0, 0.92, 0.9), vec3(1.0, 0.3, 0.32), smoothstep(0.0, 0.5, life));
  c = mix(c, vec3(0.6, 0.04, 0.1), smoothstep(0.5, 1.0, life));
  return vec4(c * (core * 1.6 + halo) * alpha, 0.0);
}`,
  behavior,
}
