import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random, shaderHash } from '../math'
import { accumulator, burning } from '../shared'

const EMBER = 0
const SMOKE = 1
const ASH = 2

const updraft = (x: number, y: number, time: number, seed: number) =>
  Math.sin(y * 0.025 + time * 2.1 + seed * 9.4) * 0.6 + Math.sin(x * 0.02 - time * 1.7 + seed * 3) * 0.4

function behavior(): Behavior {
  const fuel = accumulator(60)

  return {
    emit(line, { pool, dt }) {
      const [from, to] = burning(line, 650)
      if (to <= from) return
      for (let n = fuel(line, (to - from) * 0.1 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        const r = random()
        pool.x[i] = between(from, to)
        if (r < 0.62) {
          pool.kind[i] = EMBER
          pool.y[i] = line.y + line.h * random() * 0.6
          pool.vx[i] = between(-30, 30)
          pool.vy[i] = between(-170, -60)
          pool.life[i] = between(0.9, 2.2)
          pool.base[i] = between(2.2, 4)
        } else if (r < 0.82) {
          pool.kind[i] = SMOKE
          pool.y[i] = line.y - between(80, 130) * (1 - 0.8 * line.cover)
          pool.vx[i] = between(-8, 8)
          pool.vy[i] = between(-40, -20)
          pool.life[i] = between(2, 3.6)
          pool.base[i] = between(20, 40)
          pool.rot[i] = random() * Math.PI * 2
          pool.spin[i] = between(-0.4, 0.4)
        } else {
          pool.kind[i] = ASH
          pool.y[i] = line.y + line.h * 0.3
          pool.vx[i] = between(-25, 25)
          pool.vy[i] = between(-110, -50)
          pool.life[i] = between(1.6, 3.2)
          pool.base[i] = between(6, 13)
          pool.rot[i] = random() * Math.PI * 2
          pool.spin[i] = between(-3, 3)
        }
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      const kind = pool.kind[i]
      if (kind === EMBER) {
        const vy = (pool.vy[i] = Math.max(pool.vy[i] - 100 * dt, -260))
        const vx = (pool.vx[i] = (pool.vx[i] + updraft(pool.x[i], pool.y[i], time, seed) * 380 * dt) * (1 - 2.2 * dt))
        pool.move(i, dt)
        const stretch = Math.min(1 + Math.sqrt(vx * vx + vy * vy) / 60, 5)
        pool.size[i] = pool.base[i] * stretch
        pool.rot[i] = Math.atan2(-vx, -vy)
        pool.params[i * 4] = stretch
        pool.alpha[i] = envelope(life, 0.1, 0.5)
      } else if (kind === SMOKE) {
        pool.vy[i] -= 6 * dt
        pool.vx[i] = (pool.vx[i] + Math.sin(time * 0.9 + seed * 7) * 26 * dt) * (1 - 0.5 * dt)
        pool.move(i, dt)
        pool.rot[i] += pool.spin[i] * dt
        pool.size[i] = pool.base[i] * (0.6 + 1.7 * life)
        pool.alpha[i] = envelope(life, 0.2, 0.35)
      } else {
        pool.vy[i] = (pool.vy[i] + (-70 * (1 - life) + 30 * life) * dt) * (1 - 0.9 * dt)
        pool.vx[i] = (pool.vx[i] + updraft(pool.x[i], pool.y[i], time, seed) * 140 * dt) * (1 - 1.2 * dt)
        pool.move(i, dt)
        pool.rot[i] += pool.spin[i] * dt
        pool.size[i] = pool.base[i] * (1 - 0.35 * life)
        pool.params[i * 4] = Math.cos(time * (3 + 6 * shaderHash(seed, 5)) + seed * 20)
        pool.alpha[i] = envelope(life, 0.08, 0.7)
      }
      return life < 1
    },
  }
}

export const fire: Preset = {
  name: 'fire',
  pad: [50, 150, 50],
  tint: [1, 0.48, 0.08],
  selection: { dark: 'color:#fff3e2;text-shadow:0 0 7px rgb(255 120 30 / .75)', light: 'color:#2a1206' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 0.0);
  float ig = (hash(vec2(seed, 3.0)) - 0.5) * hs.x * 1.2;
  float reach = age * 650.0 - abs(local.x - ig);
  float burnD = reach > 80.0 ? -reach : (fbm(world * 0.045 + seed * 9.0) - 0.5) * 70.0 - reach;
  float burned = smoothstep(6.0, -6.0, burnD);
  float frontNear = 1.0 - smoothstep(0.0, 1.0, age * 650.0 - 2.0 * hs.x - 80.0 - abs(ig));
  float rough = (fbm(world * 0.09 + seed * 4.0) - 0.5) * 6.0 + (noise(world * 0.4) - 0.5) * 1.6;
  float d = sdRBox(local, hs, 4.0) + rough;
  float band = smoothstep(0.8, -0.8, d);
  vec3 ember = vec3(0.0);
  if (band > 0.0 && burned > 0.0) {
    vec3 v = voronoi(world * 0.055 + seed * 5.0 + (vec2(fbm3(world * 0.08), fbm3(world * 0.08 + 7.0)) - 0.5) * 0.6);
    float crack = smoothstep(0.12, 0.0, v.y - v.x);
    float breath = fbm(world * 0.025 + vec2(t * 0.35, -t * 0.5) + seed * 3.0);
    float heat = crack * smoothstep(0.35, 0.75, breath) + pow(noise(world * 0.45 + t * 0.15), 12.0) * 1.5;
    heat *= smoothstep(-6.0, -40.0, burnD);
    vec3 hot = mix(vec3(0.55, 0.06, 0.0), vec3(1.0, 0.38, 0.04), smoothstep(0.2, 0.7, heat));
    hot = mix(hot, vec3(1.0, 0.8, 0.4), smoothstep(0.8, 1.3, heat));
    vec3 charc = mix(vec3(0.045, 0.032, 0.028), vec3(0.97, 0.8, 0.56), uLight) * (0.7 + 0.6 * fbm(world * 0.12 + 2.0) * mix(1.0, 0.25, uLight) + 0.22 * uLight);
    ember = (charc + hot * heat * mix(0.7, 0.5, uLight)) * band * burned;
  }
  float front = exp(-abs(burnD) / 5.0) * band;
  float scorch = smoothstep(45.0, 0.0, burnD) * (1.0 - burned) * band;
  float rim = exp(-abs(d) / 2.2) * burned * (0.55 + 0.45 * noise(vec2((world.x + world.y) * 0.08, t * 3.0)));
  float spill = exp(-max(d, 0.0) / 20.0) * (1.0 - band) * burned * (0.7 + 0.3 * noise(vec2(t * 6.0, seed)));
  float above = -hs.y - local.y;
  vec3 rgb = vec3(0.0);
  if (above > -3.0 && cover < 1.0) {
    float H = 95.0 * (0.65 + 0.7 * noise(vec2(world.x * 0.011 + seed * 5.0, t * 0.55)));
    vec2 fq = vec2(world.x * 0.026, world.y * 0.03 + t * 2.3);
    vec2 wq = fq * 1.7 + (vec2(fbm3(fq * 1.1 + 3.1), fbm3(fq * 1.1 + 7.7)) - 0.5) * 2.0;
    float n = fbm(wq + vec2(0.0, t * 0.8));
    float tongue = 0.5 + 0.5 * sin(world.x * 0.085 + n * 6.0 + seed * 20.0);
    float h01 = max(above, 0.0) / H;
    float xin = smoothstep(hs.x + 4.0, hs.x - 34.0, abs(local.x));
    float f = (n - 0.32) * 2.6 - h01 * 1.05 - (1.0 - tongue) * h01 * 0.7;
    f -= (1.0 - xin) * 1.6 + (1.0 - smoothstep(-10.0, 30.0, -burnD)) * 2.0;
    f = mix(f, -1.0, cover);
    f *= smoothstep(-3.0, 4.0, above);
    float k = clamp(f * 1.4, 0.0, 1.0);
    vec3 fc = mix(vec3(0.45, 0.03, 0.0), vec3(1.0, 0.3, 0.02), smoothstep(0.0, 0.3, k));
    fc = mix(fc, vec3(1.0, 0.72, 0.2), smoothstep(0.3, 0.65, k));
    fc = mix(fc, vec3(1.0, 0.95, 0.82), smoothstep(0.82, 1.0, k));
    float flame = smoothstep(0.0, 0.18, f);
    float root = exp(-max(above, 0.0) / 5.0) * smoothstep(0.2, 0.6, k);
    rgb = fc * flame * 1.05 + vec3(0.12, 0.25, 0.9) * root * 0.3 * flame;
  }
  float a = band * burned * 0.86 + scorch * 0.35;
  rgb += ember;
  rgb += mix(vec3(0.16, 0.07, 0.02), vec3(0.45, 0.24, 0.1), uLight) * scorch * 0.35;
  rgb += (vec3(1.0, 0.85, 0.5) * mix(0.5, 1.2, uLight) + vec3(1.0, 0.4, 0.05)) * front * frontNear * mix(0.7, 1.0, uLight);
  rgb += vec3(1.0, 0.45, 0.08) * rim * 0.8 + vec3(1.0, 0.4, 0.08) * spill * 0.3;
  return vec4(rgb * fade, min(a, 1.0) * fade);
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  if (kind < 0.5) {
    vec2 q = vec2(p.x * params.x, p.y);
    float r2 = dot(q, q);
    float core = exp(-r2 * 8.0), halo = exp(-r2 * 2.0) * 0.35;
    float heat = (1.0 - life) * (0.7 + 0.3 * sin(t * 31.0 + seed * 70.0));
    vec3 c = mix(vec3(0.6, 0.07, 0.0), vec3(1.0, 0.42, 0.05), smoothstep(0.1, 0.5, heat));
    c = mix(c, vec3(1.0, 0.88, 0.55), smoothstep(0.6, 1.0, heat));
    return vec4(c * (core * 1.6 + halo) * alpha, 0.0);
  }
  if (kind < 1.5) {
    vec2 q = p * vec2(1.0, 0.8);
    float n1 = fbm(q * 1.3 + seed * 11.0 + vec2(0.0, t * 0.3));
    float n2 = fbm(q * 2.8 - seed * 5.0 + vec2(t * 0.2, t * 0.45));
    float r = length(q) + (n1 - 0.5) * 1.1;
    float disc = smoothstep(1.0, 0.1, r);
    float strand = pow(1.0 - abs(n2 * 2.0 - 1.0), 3.0);
    float a = disc * (0.25 + 0.75 * strand) * alpha * 0.22;
    vec3 c = mix(vec3(0.2, 0.16, 0.14), vec3(0.09, 0.09, 0.1), life) + vec3(0.7, 0.28, 0.05) * (1.0 - life) * (1.0 - life) * 0.5;
    return vec4(c * a, a);
  }
  float fl = max(abs(params.x), 0.14);
  vec2 q = vec2(p.x / fl, p.y);
  float n = fbm(p * 2.3 + seed * 30.0);
  float d = length(q * vec2(1.0, 1.25)) + (n - 0.5) * 0.95 - 0.6;
  float aa = fwidth(d) * 1.2;
  float inside = smoothstep(aa, -aa, d);
  float edge = smoothstep(-0.3, 0.0, d) * inside;
  float burn = (1.0 - life * 0.85) * (0.6 + 0.4 * sin(t * 9.0 + seed * 40.0));
  vec3 c = vec3(0.05, 0.035, 0.03) * (0.6 + 0.8 * n) * (0.6 + 0.4 * fl);
  vec3 glow = mix(vec3(0.75, 0.12, 0.0), vec3(1.0, 0.62, 0.18), burn) * edge * burn * 1.5;
  float a = inside * alpha;
  return vec4((c + glow) * a, a * 0.92);
}`,
  behavior,
}
