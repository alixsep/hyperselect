import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const glow = accumulator(4)

  return {
    emit(line, { pool, dt }) {
      if (line.age < 0.6) return
      for (let n = glow(line, line.w * 0.004 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * line.w
        pool.y[i] = line.y + line.h * between(-0.2, 1.2)
        pool.vx[i] = between(-10, 10)
        pool.vy[i] = between(-12, -3)
        pool.life[i] = between(2.4, 4.2)
        pool.size[i] = between(14, 22)
      }
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 0.8)
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      pool.vx[i] += Math.sin(time * 1.3 + seed * 17) * 14 * dt
      pool.vy[i] += Math.cos(time * 1.1 + seed * 23) * 10 * dt
      pool.move(i, dt)
      pool.alpha[i] = envelope(life, 0.3, 0.55) * (0.75 + 0.25 * Math.sin(time * 2.2 + seed * 40))
      return life < 1
    },
  }
}

export const wisp: Preset = {
  name: 'wisp',
  pad: [22, 18, 18],
  tint: [0.52, 0.95, 0.84],
  selection: { dark: 'color:#effffa;text-shadow:0 0 8px rgb(80 230 190 / .45)', light: 'color:#08332c' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 1.0);
  float d = sdRBox(local, hs, min(hs.y, 8.0));
  float span = smoothstep(hs.x + 18.0, hs.x - 14.0, abs(local.x));
  float head = -hs.x - 30.0 + age * 520.0;
  float drawn = smoothstep(0.0, -40.0, local.x - head);
  float tip = exp(-abs(local.x - head) / 12.0) * step(age * 520.0, 2.0 * hs.x + 80.0);
  float thread = 0.0, aura = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float f = 0.016 + 0.007 * fk + 0.004 * hash(vec2(seed, fk));
    float ph = world.x * f + (noise(vec2(world.x * 0.008, fk * 4.0 + seed * 3.0)) - 0.5) * 4.0 + t * (0.5 + 0.25 * fk) * (fk == 1.0 ? -1.0 : 1.0) + seed * 20.0 + fk * 2.1;
    float amp = (hs.y + 6.0) * (0.55 + 0.45 * sin(world.x * 0.004 + fk * 1.7 + t * 0.3));
    float y = sin(ph) * amp + (noise(vec2(world.x * 0.03, fk * 5.0 + t * 0.4)) - 0.5) * 5.0;
    float slope = cos(ph) * f * amp;
    float dist = abs(local.y - y) / sqrt(1.0 + slope * slope);
    float pulse = 0.35 + 0.65 * smoothstep(0.35, 0.85, noise(vec2(world.x * 0.01 - t * (0.6 + 0.2 * fk), fk * 9.0 + seed)));
    thread += smoothstep(0.9, 0.1, dist) * pulse;
    aura += exp(-dist / 4.0) * pulse;
  }
  float on = span * drawn;
  thread = min(thread, 1.0) * on;
  aura = min(aura, 1.5) * on;
  tip *= aura;
  float mist = smoothstep(4.0, -10.0, d) * drawn * (0.08 + 0.06 * fbm3(world * 0.03 + vec2(t * 0.1, 0.0)));
  if (uLight > 0.5) {
    vec4 c = vec4(vec3(0.78, 0.94, 0.9), 1.0) * (mist * 2.2 + aura * 0.12);
    c = over(c, vec3(0.1, 0.55, 0.48), thread * 0.85);
    c = over(c, vec3(0.5, 0.85, 0.78), tip * 0.5);
    return c * fade;
  }
  vec3 rgb = vec3(0.3, 0.85, 0.72) * mist + vec3(0.25, 0.9, 0.75) * aura * 0.22 + vec3(0.8, 1.0, 0.95) * thread * 0.85;
  rgb += vec3(0.7, 1.0, 0.92) * tip * 0.8;
  return vec4(rgb, mist * 0.6) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r = length(p);
  float core = exp(-r * r * 12.0), halo = exp(-r * 4.5) * 0.45;
  vec3 c = mix(vec3(0.85, 1.0, 0.96) * core * 1.4 + vec3(0.3, 0.95, 0.78) * halo, vec3(0.1, 0.6, 0.52) * (core + halo), uLight);
  return vec4(c * alpha, uLight * (core + halo) * alpha);
}`,
  behavior,
}
