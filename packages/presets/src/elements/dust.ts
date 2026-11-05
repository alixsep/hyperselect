import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const motes = accumulator(8)
  const burst = accumulator(14)

  return {
    emit(line, { pool, dt }) {
      const cx = line.x + line.w / 2
      const cy = line.y + line.h / 2
      const bursting = line.age < 0.25
      for (let n = burst(line, bursting ? line.w * 0.5 * dt + 40 * dt : 0); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        const angle = random() * Math.PI * 2
        const speed = between(40, 120)
        pool.x[i] = cx + (random() - 0.5) * line.w
        pool.y[i] = cy + (random() - 0.5) * line.h
        pool.vx[i] = Math.cos(angle) * speed
        pool.vy[i] = Math.sin(angle) * speed * 0.5
        pool.life[i] = between(0.6, 1.1)
        pool.base[i] = between(18, 30)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-0.6, 0.6)
        pool.kind[i] = 1
      }
      for (let n = motes(line, line.w * 0.012 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * line.w
        pool.y[i] = line.y + between(-14, line.h + 8)
        pool.vx[i] = between(-8, 8)
        pool.vy[i] = between(-6, 4)
        pool.life[i] = between(1.6, 3)
        pool.base[i] = between(3, 5.5)
        pool.kind[i] = 0
      }
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 0.6)
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      if (pool.kind[i] > 0.5) {
        pool.vx[i] *= 1 - 3.5 * dt
        pool.vy[i] *= 1 - 3.5 * dt
        pool.size[i] = pool.base[i] * (0.6 + 1.2 * life)
        pool.alpha[i] = envelope(life, 0.1, 0.7)
      } else {
        pool.vx[i] += Math.sin(time * 0.9 + seed * 17) * 10 * dt
        pool.vy[i] += Math.cos(time * 0.7 + seed * 23) * 8 * dt
        pool.size[i] = pool.base[i]
        pool.alpha[i] = envelope(life, 0.25, 0.35)
      }
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      return life < 1
    },
  }
}

export const dust: Preset = {
  name: 'dust',
  pad: [14, 10, 10],
  tint: [0.75, 0.65, 0.5],
  selection: { dark: 'color:#fff9ef;text-shadow:0 1px 3px rgb(30 20 8 / .9)', light: 'color:#1d160c' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float rough = (fbm(world * 0.06 + seed * 5.0) - 0.5) * 9.0;
  float d = sdRBox(local, hs, 6.0) + rough;
  float puffD = sdRBox(local, hs, 8.0) - 10.0 * exp(-age * 3.0) - (fbm3(world * 0.05 + vec2(age * 0.8, seed)) - 0.5) * 14.0;
  if (min(d, puffD) > 8.0) return vec4(0.0);
  float settle = smoothstep(0.1, 0.9, age);
  float cloud = smoothstep(4.0, -10.0, puffD) * exp(-age * 2.4) * (0.6 + 0.4 * fbm3(world * 0.08 - age * 0.5));
  float aa = fwidth(d);
  float film = smoothstep(aa * 3.0, -aa * 3.0, d) * settle;
  float grain = noise(world * 1.1 + seed * 9.0) * 0.6 + noise(world * 0.37) * 0.4;
  float drift = 0.65 + 0.35 * fbm3(world * 0.03 + seed * 2.0 + vec2(t * 0.05, 0.0));
  float density = film * smoothstep(0.15, 0.6, grain * 0.7 + drift * 0.5) * mix(0.62, 0.5, uLight);
  float speck = step(0.93, hash(floor(world / 2.0) + seed)) * film * 0.5;
  vec3 tan = mix(vec3(0.5, 0.42, 0.3), vec3(0.72, 0.62, 0.46), uLight) * (0.85 + 0.3 * grain);
  vec3 puffC = mix(vec3(0.62, 0.54, 0.42), vec3(0.8, 0.72, 0.58), uLight);
  vec4 c = vec4(tan, 1.0) * clamp(density + speck * 0.4, 0.0, 1.0);
  c = over(c, puffC, clamp(cloud * 0.85, 0.0, 1.0));
  return c * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r2 = dot(p, p);
  if (kind > 0.5) {
    float n = noise(p * 2.0 + seed * 40.0);
    float a = exp(-r2 * 3.0) * (0.55 + 0.45 * n) * alpha * 0.5;
    vec3 c = mix(vec3(0.6, 0.52, 0.4), vec3(0.78, 0.7, 0.56), uLight);
    return vec4(c * a, a);
  }
  float twinkle = smoothstep(0.7, 1.0, sin(t * (2.0 + seed * 3.0) + seed * 50.0));
  float core = exp(-r2 * 10.0);
  float star = exp(-abs(p.x * p.y) * 60.0) * exp(-r2 * 2.0) * twinkle;
  if (uLight > 0.5) {
    float a = clamp(core * 0.75 + star * 0.3, 0.0, 1.0) * alpha;
    return vec4(vec3(0.5, 0.4, 0.26) * a, a);
  }
  vec3 c = vec3(1.0, 0.88, 0.66) * (core * (0.5 + 0.6 * twinkle) + star * 0.8) * alpha;
  return vec4(c, 0.0);
}`,
  behavior,
}
