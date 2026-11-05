import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'
import { cosmos } from './shared'

function behavior(): Behavior {
  const motes = accumulator(12)

  return {
    emit(line, { pool, dt }) {
      const reach = Math.min(line.w, line.age * 1200 - 40)
      if (reach <= 0) return
      for (let n = motes(line, reach * 0.018 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * reach
        pool.y[i] = line.y + line.h * between(0.1, 0.9)
        pool.vx[i] = between(4, 16)
        pool.vy[i] = between(-14, -3)
        pool.life[i] = between(1.6, 3.2)
        pool.base[i] = between(4, 9)
        pool.rot[i] = random() * Math.PI
        pool.spin[i] = between(-0.6, 0.6)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      pool.vx[i] += Math.sin(time * 1.3 + pool.seed[i] * 20) * 6 * dt
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.size[i] = pool.base[i] * (1 - 0.4 * life)
      pool.alpha[i] = envelope(life, 0.2, 0.55)
      return life < 1
    },
  }
}

export const stardust: Preset = {
  name: 'stardust',
  pad: [16, 10, 10],
  tint: [0.92, 0.78, 0.5],
  selection: {
    dark: 'color:#fffaf0;text-shadow:0 0 4px rgb(20 14 4 / .8)',
    light: 'color:#2a2010',
  },
  surface: /* glsl */ `${cosmos}
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.0);
  float d = sdRBox(local, hs, 10.0);
  float cloud = fbm3(world * vec2(0.018, 0.045) + vec2(-t * 0.06, seed * 7.0));
  float front = -hs.x - 40.0 + age * 1200.0;
  float sweep = smoothstep(front + 30.0, front - 30.0, local.x + (cloud - 0.5) * 90.0);
  float body = smoothstep(5.0, -7.0, d + (cloud - 0.5) * 16.0) * sweep;
  if (body <= 0.0) return vec4(0.0);
  float thin = smoothstep(1.0 - fade, 1.25 - fade, cloud + 0.25);
  float haze = body * thin * (0.4 + 0.6 * smoothstep(0.3, 0.75, cloud));
  vec4 g = starCell(world + vec2(t * 5.0, -t * 1.5), 5.0, seed);
  float glint = pow(0.5 + 0.5 * sin(t * (1.2 + 1.8 * g.w) + g.w * 60.0), 6.0);
  float grain = point(g.xy, 0.35 + 0.35 * g.z) * step(0.4, g.z) * (0.25 + 0.75 * glint) * body * thin;
  vec3 gold = vec3(1.0, 0.84, 0.55), silver = vec3(0.88, 0.9, 1.0);
  vec3 sparkle = mix(gold, silver, step(0.7, g.w));
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.96, 0.9, 0.76), 1.0) * haze * 0.7;
    c = over(c, mix(vec3(0.72, 0.54, 0.2), vec3(0.5, 0.52, 0.62), step(0.7, g.w)), clamp(grain * 1.1, 0.0, 1.0));
    return c * fade;
  }
  vec3 rgb = gold * haze * 0.16 + sparkle * grain * 1.3;
  return vec4(rgb, haze * 0.35) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 a = abs(p);
  float core = exp(-dot(p, p) * 30.0);
  float cross = exp(-a.x * 14.0) * exp(-a.y * 2.6) + exp(-a.y * 14.0) * exp(-a.x * 2.6);
  float shine = 0.6 + 0.4 * sin(t * 2.0 + seed * 40.0);
  vec3 c = mix(vec3(1.0, 0.86, 0.58), vec3(0.9, 0.92, 1.0), step(0.75, seed));
  return vec4(c * (core * 1.4 + cross * 0.7) * shine * alpha, 0.0);
}`,
  behavior,
}
