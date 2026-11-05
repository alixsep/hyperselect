import type { Behavior, Line, LineLookup, Particles, Preset } from 'hyperselect'
import { between, clamp01, envelope, random, smooth } from '../math'
import { accumulator } from '../shared'

const SPARK = 0
const BOLT = 1
const BEAD = 2

interface Anchor {
  x: number
  y: number
  nx: number
  ny: number
}

function rimPoint(line: Line): Anchor {
  const r = random()
  if (r < 0.86) {
    const top = r < 0.43
    return { x: line.x - 4 + random() * (line.w + 8), y: top ? line.y + 1 : line.y + line.h - 1, nx: 0, ny: top ? -1 : 1 }
  }
  const left = r < 0.93
  return { x: left ? line.x - 6 : line.x + line.w + 6, y: line.y + line.h * between(0.3, 0.7), nx: left ? -1 : 1, ny: 0 }
}

function openRimPoint(line: Line, lines: LineLookup): Anchor | null {
  for (let attempt = 0; attempt < 4; attempt++) {
    const point = rimPoint(line)
    if (!point.ny || !lines.edgeCovered(line, point.ny < 0, point.x)) return point
  }
  return null
}

function spark(pool: Particles, line: Line, x: number, y: number, vx: number, vy: number): void {
  const i = pool.spawn(line.id)
  if (i < 0) return
  pool.kind[i] = SPARK
  pool.x[i] = x
  pool.y[i] = y
  pool.vx[i] = vx
  pool.vy[i] = vy
  pool.life[i] = between(0.35, 0.95)
  pool.base[i] = between(2.6, 4.4)
}

function sparksFrom(pool: Particles, line: Line, from: Anchor, count: number, speed: number, spread: number): void {
  for (let n = 0; n < count; n++) {
    spark(pool, line, from.x, from.y, from.nx * between(40, speed) + between(-spread, spread), from.ny * between(40, speed) + between(-200, 40))
  }
}

function bolt(pool: Particles, line: Line, from: Anchor, big: boolean): Anchor | null {
  const i = pool.spawn(line.id)
  if (i < 0) return null
  const length = big ? between(70, 120) : between(26, 64)
  const angle = Math.atan2(from.ny, from.nx) + between(-0.75, 0.75)
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  pool.kind[i] = BOLT
  pool.x[i] = from.x + (dx * length) / 2
  pool.y[i] = from.y + (dy * length) / 2
  pool.rot[i] = Math.atan2(-dx, -dy)
  pool.size[i] = length
  pool.life[i] = big ? between(0.22, 0.4) : between(0.1, 0.26)
  return { x: from.x + dx * length * 0.85, y: from.y + dy * length * 0.85, nx: dx, ny: dy }
}

function bead(pool: Particles, line: Line): void {
  const i = pool.spawn(line.id)
  if (i < 0) return
  const from = rimPoint(line)
  pool.kind[i] = BEAD
  pool.x[i] = from.x
  pool.y[i] = from.y
  pool.vx[i] = from.nx * between(8, 30) + between(-12, 12)
  pool.vy[i] = from.ny * between(8, 30) - between(4, 16)
  pool.life[i] = between(0.9, 2)
  pool.base[i] = between(7, 13)
}

function behavior(): Behavior {
  const charge = accumulator()
  const beads = accumulator(20)
  const lit = new WeakSet<Line>()
  const nextBolt = new WeakMap<Line, number>()

  return {
    emit(line, { pool, lines, dt }) {
      const head = line.x - 24 + line.age * 1500
      const end = line.x + line.w
      if (head < end + 20) {
        for (let n = charge(line, 150 * dt); n > 0; n--) {
          spark(pool, line, Math.min(head, end), line.y + line.h * random(), between(-420, -40), between(-300, 140))
        }
        return
      }
      if (!lit.has(line)) {
        lit.add(line)
        for (let n = Math.min(90, 8 + line.w * 0.08); n > 0; n--) {
          const from = openRimPoint(line, lines)
          if (from) sparksFrom(pool, line, from, 1, 260, 90)
        }
      }
      const wait = (nextBolt.get(line) ?? 0) - dt
      nextBolt.set(line, wait > 0 ? wait : between(0.07, 0.32) * Math.min(2.5, Math.max(0.35, 320 / line.w)))
      const from = wait <= 0 && openRimPoint(line, lines)
      if (from) {
        const big = random() < 0.12
        const tip = bolt(pool, line, from, big)
        if (tip) {
          sparksFrom(pool, line, tip, big ? 10 : 3 + Math.floor(random() * 4), 280, 130)
          sparksFrom(pool, line, from, 2, 160, 120)
        }
      }
      for (let n = beads(line, line.w * 0.012 * dt); n > 0; n--) bead(pool, line)
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const kind = pool.kind[i]
      if (kind === SPARK) {
        pool.vy[i] += 820 * dt
        pool.vx[i] *= 1 - 1.5 * dt
        pool.vy[i] *= 1 - 1.5 * dt
        pool.move(i, dt)
        const stretch = Math.min(1 + Math.hypot(pool.vx[i], pool.vy[i]) / 55, 7)
        pool.size[i] = pool.base[i] * stretch * (1 - 0.4 * life)
        pool.rot[i] = Math.atan2(-pool.vx[i], -pool.vy[i])
        pool.params[i * 4] = stretch
        pool.alpha[i] = (1 - smooth(clamp01((life - 0.45) / 0.55))) * (0.75 + 0.25 * Math.sin(time * 50 + pool.seed[i] * 90))
      } else if (kind === BOLT) {
        pool.alpha[i] = envelope(life, 1 / 12, 0.55)
      } else {
        pool.vx[i] = (pool.vx[i] + (random() - 0.5) * 1400 * dt) * (1 - 3.5 * dt)
        pool.vy[i] = (pool.vy[i] + ((random() - 0.5) * 1400 - 20) * dt) * (1 - 3.5 * dt)
        pool.move(i, dt)
        pool.size[i] = pool.base[i] * (1 - 0.5 * life)
        pool.alpha[i] = envelope(life, 0.12, 0.5)
      }
      return life < 1
    },
  }
}

export const volt: Preset = {
  name: 'volt',
  pad: [90, 80, 80],
  tint: [0.66, 0.52, 1],
  selection: {
    dark: 'color:#f4f8ff;text-shadow:0 0 6px rgb(130 170 255 / .95),0 0 18px rgb(150 110 255 / .6)',
    light: 'color:#1d1446',
  },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(6.0, 0.5);
  float rd = min(hs.y, 10.0);
  float d = sdRBox(local, hs, rd);
  float inside = smoothstep(0.8, -0.8, d);
  float run = age * 1500.0;
  float head = -hs.x - 24.0 + run;
  float lit = smoothstep(10.0, -26.0, local.x - head);
  float ignited = smoothstep(2.0 * hs.x + 24.0, 2.0 * hs.x + 90.0, run);
  float ts = floor(t * 30.0);
  float on = mix(0.15, 1.0, step(hash(vec2(ts, seed * 7.0)), smoothstep(0.05, 0.75, age)));
  float hum = 0.92 + 0.08 * noise(vec2(t * 23.0, seed * 9.0));
  float power = lit * on * hum;
  float fil = 0.0, fil2 = 0.0, arcs = 0.0;
  if (inside > 0.0) {
    vec2 q = world * 0.016 + seed * 7.0;
    vec2 wp = vec2(fbm3(q + vec2(t * 0.30, -t * 0.22)), fbm3(q + vec2(5.2, 1.3) + vec2(-t * 0.26, t * 0.31)));
    float pl = fbm(q * 1.7 + (wp - 0.5) * 2.6 + vec2(0.0, t * 0.12));
    fil = pow(1.0 - abs(pl * 2.0 - 1.0), 5.0);
    fil2 = pow(1.0 - abs(fbm3(q * 3.1 - wp * 1.5 + t * 0.2) * 2.0 - 1.0), 8.0);
    for (int k = 0; k < 2; k++) {
      float fk = float(k);
      float ph = floor(t * (11.0 + fk * 5.0) + seed * 13.0 + fk * 0.5);
      float yo = (fbm3(vec2(world.x * 0.012 + ph * 1.93 + fk * 7.0, fk * 3.0 + seed * 9.0)) - 0.5) * hs.y * 2.6
               + (noise(vec2(world.x * 0.22, ph * 3.1 + fk)) - 0.5) * 4.0;
      float dy = abs(local.y - yo);
      float cell = world.x / 140.0 + hash(vec2(ph, fk)) * 3.0, fr = fract(cell);
      float seg = step(0.62, hash(vec2(floor(cell), ph + fk * 17.0))) * smoothstep(0.0, 0.2, fr) * smoothstep(1.0, 0.8, fr);
      arcs += (smoothstep(1.3, 0.2, dy) + exp(-dy / 3.5) * 0.4) * seg;
    }
    arcs *= inside;
  }
  float phr = floor(t * 18.0 + seed * 5.0);
  float per = world.x + world.y * 1.3;
  float rj = abs((noise(vec2(per * 0.16, phr * 2.3)) - 0.5) * 8.0 + (noise(vec2(per * 0.7, phr * 1.1)) - 0.5) * 2.2);
  float cr = per / 120.0 + hash(vec2(phr, 4.0)) * 5.0, frr = fract(cr);
  float segR = step(0.62, hash(vec2(floor(cr), phr))) * smoothstep(0.0, 0.25, frr) * smoothstep(1.0, 0.75, frr);
  float rimArc = (smoothstep(1.2, 0.1, abs(d - rj)) + exp(-abs(d - rj) / 3.0) * 0.35) * segR;
  float ad = abs(d);
  float tube = smoothstep(1.7, 0.0, ad);
  float halo = exp(-ad / (d < 0.0 ? 2.0 : 5.0));
  float bloom = exp(-max(d, 0.0) / 26.0) * (1.0 - inside);
  vec3 cCore = vec3(0.88, 0.96, 1.0), cBlue = vec3(0.25, 0.55, 1.0), cViolet = vec3(0.56, 0.28, 1.0);
  vec3 rgb = cCore * tube * 1.1 + cBlue * halo * 0.55 + mix(cViolet, cBlue, 0.3) * bloom * 0.24;
  rgb += inside * (mix(cViolet, cBlue, fil2) * fil * 0.24 + cBlue * fil2 * 0.13 + cViolet * 0.035);
  rgb += (cBlue * 0.4 + cViolet * 0.28) * min(arcs, 1.0);
  rgb += (cCore * 0.9 + cBlue * 0.45) * rimArc * ignited;
  rgb *= power;
  float headGlow = exp(-length(vec2(local.x - head, local.y * 1.3)) / 7.0) * (1.0 - ignited);
  rgb += (cCore * 0.8 + cBlue * 0.9) * headGlow;
  float tIgn = (2.0 * hs.x + 24.0) / 1500.0;
  float r = max(age - tIgn, 0.0) * 430.0;
  float ring = exp(-abs(d - r) / (2.0 + r * 0.1)) * (1.0 - smoothstep(8.0, 75.0, r)) * step(tIgn, age);
  rgb += (cBlue * 0.55 + cViolet * 0.3) * ring;
  if (uLight > 0.5) {
    vec3 lavender = vec3(0.9, 0.86, 1.0), violet = vec3(0.6, 0.46, 1.0), glow = vec3(0.8, 0.72, 1.0);
    vec4 c = vec4(glow, 1.0) * clamp((halo * 0.45 + bloom * 0.6) * power, 0.0, 1.0);
    c = over(c, lavender, inside * 0.9 * lit);
    c = over(c, glow, clamp((fil * 0.5 + fil2 * 0.3) * inside * power, 0.0, 1.0));
    c = over(c, violet, clamp((arcs * 0.75 + rimArc * ignited) * power, 0.0, 1.0));
    c = over(c, violet * 0.9, clamp(tube * power, 0.0, 1.0));
    c = over(c, glow, clamp(headGlow + ring * 0.8, 0.0, 1.0));
    return c * fade;
  }
  float a = inside * 0.74 * lit;
  rgb += vec3(0.012, 0.01, 0.04) * a;
  return vec4(rgb * fade, a * fade);
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  if (kind < 0.5) {
    vec2 q = vec2(p.x * params.x, p.y);
    float r2 = dot(q, q);
    float core = exp(-r2 * 7.0), halo = exp(-r2 * 1.8) * 0.35;
    vec3 c = mix(vec3(0.92, 0.97, 1.0), vec3(0.35, 0.65, 1.0), smoothstep(0.05, 0.5, life));
    c = mix(c, vec3(0.58, 0.32, 1.0), smoothstep(0.5, 1.0, life));
    return vec4(c * (core * 1.8 + halo) * alpha, 0.0);
  }
  if (kind < 1.5) {
    float u = (p.y + 1.0) * 0.5;
    float ts = floor(t * 24.0 + seed * 7.0);
    float x0 = (fbm(vec2(u * 2.6, ts * 1.37 + seed * 40.0)) - 0.5) * 1.1 * sqrt(u)
             + (noise(vec2(u * 15.0, ts + seed * 9.0)) - 0.5) * 0.16 * u;
    float reach = smoothstep(1.0, 0.82, u + 0.12 * hash(vec2(ts, seed)));
    float dx = abs(p.x - x0);
    float core = smoothstep(0.05, 0.0, dx) * reach * (1.0 - u * 0.35);
    float glow = exp(-dx * 12.0) * reach * 0.5;
    float ub = 0.3 + 0.3 * hash(vec2(seed, ts + 1.0));
    float side = hash(vec2(ts, seed * 3.0)) < 0.5 ? -1.0 : 1.0;
    float x1 = x0 + side * (u - ub) * 0.8 + (noise(vec2(u * 17.0, ts * 2.0 + seed)) - 0.5) * 0.14;
    float br = step(ub, u) * smoothstep(ub + 0.45, ub + 0.08, u);
    float dx1 = abs(p.x - x1);
    core += smoothstep(0.035, 0.0, dx1) * br * 0.8;
    glow += exp(-dx1 * 15.0) * br * 0.3;
    float on = mix(0.3, 1.0, step(0.25, hash(vec2(ts, seed * 5.0))));
    vec3 c = vec3(0.93, 0.97, 1.0) * core * 1.7 + vec3(0.3, 0.55, 1.0) * glow + vec3(0.55, 0.3, 1.0) * glow * glow * 0.8;
    return vec4(c * alpha * on, 0.0);
  }
  float r = length(p);
  float fl = 0.65 + 0.35 * sin(t * 41.0 + seed * 50.0);
  float core = exp(-r * r * 28.0), halo = exp(-r * 4.2) * 0.4 * fl;
  vec3 c = vec3(0.9, 0.96, 1.0) * core * 1.3 + mix(vec3(0.3, 0.6, 1.0), vec3(0.62, 0.32, 1.0), seed) * halo;
  return vec4(c * alpha, 0.0);
}`,
  behavior,
}
