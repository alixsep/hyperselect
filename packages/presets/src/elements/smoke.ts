import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const plume = accumulator(8)

  return {
    emit(line, { pool, lines, dt }) {
      const reached = Math.min(line.w, Math.max(0, line.age * 600 - 40))
      for (let n = plume(line, reached * 0.014 * dt); n > 0; n--) {
        const x = line.x + random() * reached
        if (lines.edgeCovered(line, true, x)) continue
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = x
        pool.y[i] = line.y + between(-2, 6)
        pool.vx[i] = between(-6, 6)
        pool.vy[i] = between(-34, -18)
        pool.life[i] = between(2.4, 3.8)
        pool.base[i] = between(38, 60)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-0.35, 0.35)
      }
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 0.8)
      const life = pool.age[i] / pool.life[i]
      pool.vy[i] *= 1 - 0.35 * dt
      pool.vx[i] = (pool.vx[i] + Math.sin(time * 0.8 + pool.seed[i] * 11) * 14 * dt) * (1 - 0.4 * dt)
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.size[i] = pool.base[i] * (0.7 + 1.6 * life)
      pool.alpha[i] = envelope(life, 0.15, 0.3)
      return life < 1
    },
  }
}

export const smoke: Preset = {
  name: 'smoke',
  pad: [26, 22, 12],
  tint: [0.5, 0.48, 0.47],
  selection: { dark: 'color:#f4f2ee;text-shadow:0 1px 3px rgb(0 0 0 / .9)', light: 'color:#0e0e10' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float d = sdRBox(local, hs, 8.0);
  float reveal = age * 600.0 - (local.x + hs.x);
  if (d > 20.0 || reveal < -10.0) return vec4(0.0);
  vec2 q = vec2(world.x * 0.02, (world.y + t * 14.0) * 0.028) + seed * 7.0;
  vec2 curl = vec2(fbm3(q * 0.8 + vec2(t * 0.04, 0.0)), fbm3(q * 0.8 + 6.1));
  float n = fbm(q + (curl - 0.5) * vec2(2.4, 1.4));
  float puff = smoothstep(0.0, 0.22, n - 0.42 - d / 16.0 + smoothstep(0.0, 60.0, reveal) * 0.25 - 0.25);
  float wisp = 1.0 - abs(fbm3(q * 2.2 - curl * 1.5 + t * 0.05) * 2.0 - 1.0);
  float lit = smoothstep(0.35, 0.75, n) * 0.6 + wisp * wisp * 0.5;
  lit *= 0.7 + 0.3 * smoothstep(hs.y, -hs.y, local.y);
  vec3 col = mix(mix(vec3(0.1, 0.1, 0.105), vec3(0.42, 0.41, 0.4), lit), mix(vec3(0.3, 0.3, 0.32), vec3(0.62, 0.62, 0.63), lit), uLight);
  float a = puff * (0.5 + 0.5 * wisp) * mix(0.9, 0.6, uLight);
  return vec4(col * a, a) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float n1 = fbm(p * 0.7 + seed * 11.0 + vec2(0.0, t * 0.2));
  float n2 = fbm3(p * 1.3 + (n1 - 0.5) * 2.0 - seed * 5.0 + vec2(t * 0.1, t * 0.25));
  float r = length(p * vec2(1.0, 0.85)) + (n1 - 0.5) * 1.1;
  float body = smoothstep(1.0, 0.0, r);
  float strand = 1.0 - abs(n2 * 2.0 - 1.0);
  float lit = smoothstep(0.7, -0.9, p.y) * 0.6 + strand * strand * 0.4;
  vec3 c = mix(mix(vec3(0.1, 0.1, 0.105), vec3(0.4, 0.39, 0.38), lit), mix(vec3(0.32, 0.32, 0.34), vec3(0.62, 0.62, 0.63), lit), uLight);
  float a = body * (0.35 + 0.65 * strand) * alpha * mix(0.75, 0.36, uLight) * (1.0 - 0.5 * life);
  return vec4(c * a, a);
}`,
  behavior,
}
