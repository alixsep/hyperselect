import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const fall = accumulator(6)

  return {
    emit(line, { pool, lines, dt }) {
      if (line.age > 2.4) return
      for (let n = fall(line, line.w * 0.03 * dt); n > 0; n--) {
        const x = line.x + random() * line.w
        if (lines.edgeCovered(line, true, x)) continue
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = x
        pool.y[i] = line.y - between(10, 46)
        pool.vx[i] = between(-10, 10)
        pool.vy[i] = between(14, 30)
        pool.life[i] = between(1.2, 2.2)
        pool.base[i] = between(5, 9)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-2.5, 2.5)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      pool.vx[i] = (pool.vx[i] + Math.sin(time * 2.1 + seed * 19) * 40 * dt) * (1 - 1.5 * dt)
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.size[i] = pool.base[i]
      pool.params[i * 4] = Math.cos(time * (2 + 3 * seed) + seed * 20)
      pool.alpha[i] = envelope(life, 0.15, 0.6)
      return life < 1
    },
  }
}

export const ash: Preset = {
  name: 'ash',
  pad: [14, 10, 10],
  tint: [0.66, 0.62, 0.58],
  selection: { dark: 'color:#fbfaf8;text-shadow:0 1px 2px rgb(0 0 0 / .9)', light: 'color:#151413' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float crumble = (fbm(world * 0.09 + seed * 7.0) - 0.5) * 7.0 + (noise(world * 0.6) - 0.5) * 2.0;
  float d = sdRBox(local, hs, 5.0) + crumble;
  if (d > 3.0) return vec4(0.0);
  float settle = smoothstep(0.0, 1.6, age - (local.x + hs.x) / 1400.0);
  float drift = fbm3(world * 0.05 + seed * 3.0);
  float powder = noise(world * 0.9 + 5.0) * 0.55 + noise(world * 0.32) * 0.45;
  float laid = smoothstep(0.0, 0.25, settle * 1.25 - (1.0 - powder) * 0.9 + drift * 0.15);
  float aa = fwidth(d);
  float dusted = smoothstep(aa, -aa, d) * laid;
  float fleck = smoothstep(0.78, 0.92, noise(world * 0.42 + 13.0)) * dusted;
  float ember = smoothstep(0.86, 0.97, noise(world * 0.2 + vec2(9.0, t * 0.05))) * smoothstep(1.5, 0.5, age) * dusted;
  float tone = 0.75 + 0.35 * powder + 0.2 * (drift - 0.5);
  vec3 gray = mix(vec3(0.46, 0.44, 0.42), vec3(0.6, 0.58, 0.56), uLight) * tone;
  gray = mix(gray, mix(vec3(0.08, 0.075, 0.07), vec3(0.32, 0.3, 0.29), uLight), fleck * 0.8);
  gray += vec3(0.9, 0.3, 0.05) * ember * 0.6;
  float a = dusted * mix(0.88, 0.8, uLight);
  return vec4(gray * a, a) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float tilt = max(abs(params.x), 0.2);
  vec2 q = vec2(p.x / tilt, p.y);
  float n = noise(q * 2.4 + seed * 30.0);
  float d = length(q) + (n - 0.5) * 0.7 - 0.62;
  float aa = fwidth(d) * 1.2;
  float inside = smoothstep(aa, -aa, d);
  float shade = 0.75 + 0.35 * params.x;
  vec3 c = mix(vec3(0.62, 0.6, 0.57), vec3(0.55, 0.53, 0.51), uLight) * shade * (0.8 + 0.4 * n);
  float a = inside * alpha * 0.9;
  return vec4(c * a, a);
}`,
  behavior,
}
