import type { Behavior, Line, LineLookup, Particles, Preset } from 'hyperselect'
import { between, clamp01, easeOutBack, easeOutCubic, envelope, random, shaderHash, smooth } from '../math'
import { accumulator } from '../shared'

const BLOSSOM = 1
const STEM = 2
const FIREFLY = 3
const SEGMENTS = 3

interface Flower {
  readonly x: number
  readonly y: number
  readonly start: number
  readonly phase: number
  readonly lean: number
  readonly bend: number
  readonly segment: number
  readonly turn: number
  readonly stems: number[]
  readonly bloom: number
  dead: boolean
}

interface Bed {
  left: number
  right: number
  readonly flowers: Flower[]
}

function flower(pool: Particles, line: Line, x: number, start: number): Flower {
  const stems: number[] = []
  for (let n = 0; n < SEGMENTS; n++) {
    const i = pool.spawn(line.id)
    if (i < 0) break
    pool.kind[i] = STEM
    pool.life[i] = Infinity
    stems.push(i)
  }
  const bloom = pool.spawn(line.id)
  if (bloom >= 0) {
    pool.kind[bloom] = BLOSSOM
    pool.life[bloom] = Infinity
    pool.base[bloom] = between(8, 12)
  }
  return {
    x,
    y: line.y + 1,
    start,
    phase: random() * Math.PI * 2,
    lean: between(-0.35, 0.35),
    bend: between(-0.05, 0.05),
    segment: between(3.5, 6),
    turn: random() * Math.PI * 2,
    stems,
    bloom,
    dead: false,
  }
}

function pose(pool: Particles, flower: Flower, time: number): void {
  const age = time - flower.start
  const grown = age <= 0 ? 0 : easeOutCubic(clamp01(age / 0.7))
  let x = flower.x
  let y = flower.y
  let angle = flower.lean
  flower.stems.forEach((i, j) => {
    const f = j / (SEGMENTS - 1)
    if (j) angle += flower.bend
    angle += (Math.sin(time * 1.3 + flower.phase) * 0.02 + Math.sin(time * 2.2 + flower.phase * 1.7) * 0.009) * f
    const length = flower.segment * (1 - 0.5 * f) * grown
    const nx = x + Math.sin(angle) * length
    const ny = Math.min(y - Math.cos(angle) * length, flower.y - 1)
    const span = Math.hypot(nx - x, ny - y)
    const size = Math.max(span * 1.3, 0.01)
    pool.x[i] = (x + nx) / 2
    pool.y[i] = (y + ny) / 2
    pool.size[i] = span < 0.05 ? 0 : size
    pool.rot[i] = Math.atan2(-(nx - x), -(ny - y))
    pool.params[i * 4] = Math.min(0.6, 1.1 / size)
    x = nx
    y = ny
  })
  const b = flower.bloom
  if (b >= 0) {
    const pop = clamp01((age - 0.55) / 0.45)
    pool.x[b] = x
    pool.y[b] = y
    pool.size[b] = pop > 0 ? pool.base[b] * easeOutBack(pop) : 0
    pool.rot[b] = flower.turn + Math.sin(time * 1.5 + flower.phase) * 0.08
  }
}

const rooted = (pool: Particles, i: number): boolean => pool.life[i] === Infinity

function letGo(pool: Particles, i: number): void {
  pool.age[i] = 0
  pool.life[i] = pool.kind[i] === BLOSSOM ? between(1.2, 2) : between(0.35, 0.9)
  pool.vx[i] = between(-14, 14)
  pool.vy[i] = between(-12, 4)
  pool.spin[i] = between(-2.5, 2.5)
}

function firefly(pool: Particles, line: Line, top: boolean): void {
  const i = pool.spawn(line.id)
  if (i < 0) return
  pool.kind[i] = FIREFLY
  pool.x[i] = line.x + random() * line.w
  pool.y[i] = top ? line.y - between(10, 60) : line.y + line.h + between(6, 40)
  pool.life[i] = between(4, 8)
  pool.size[i] = between(16, 26)
}

function sow(pool: Particles, lines: LineLookup, line: Line, bed: Bed, x: number, time: number): void {
  if (lines.edgeCovered(line, true, x) || random() > 0.55) return
  const when = time + Math.max(0, (x - line.x + 80) / 700 - line.age) + between(0.1, 0.6)
  for (let n = 1 + Math.floor(random() * 3); n > 0; n--) bed.flowers.push(flower(pool, line, x + between(-9, 9), when + between(0, 0.3)))
}

function behavior(): Behavior {
  const beds = new WeakMap<Line, Bed>()
  const swarm = accumulator()

  return {
    emit(line, { pool, lines, time, dt }) {
      const left = line.x
      const right = line.x + line.w
      let bed = beds.get(line)
      if (line.age > 0.1) {
        if (!bed) {
          const x = left + between(8, 28)
          beds.set(line, (bed = { left: x, right: x, flowers: [] }))
          sow(pool, lines, line, bed, x, time)
        }
        while (bed.right < right - 12) if ((bed.right += between(30, 60)) < right - 6) sow(pool, lines, line, bed, bed.right, time)
        while (bed.left > left + 12) if ((bed.left -= between(30, 60)) > left + 6) sow(pool, lines, line, bed, bed.left, time)
      }
      if (!bed) return
      for (const f of bed.flowers) {
        if (f.dead) continue
        if (f.x >= left - 4 && f.x <= right + 4 && !lines.edgeCovered(line, true, f.x)) pose(pool, f, time)
        else {
          f.dead = true
          for (const i of [...f.stems, f.bloom]) if (i >= 0 && rooted(pool, i)) letGo(pool, i)
        }
      }
      if (line.age < 0.9) return
      const middle = line.x + line.w / 2
      const openTop = !lines.edgeCovered(line, true, middle)
      const openBottom = !lines.edgeCovered(line, false, middle)
      if (!openTop && !openBottom) return
      for (let n = swarm(line, line.w * 0.0035 * dt); n > 0; n--) firefly(pool, line, openTop && (!openBottom || random() < 0.6))
    },

    update(i, { pool, lines, dt, time }) {
      const line = lines.get(pool.line[i])
      if (pool.kind[i] === FIREFLY) {
        const seed = pool.seed[i]
        if (!line || line.dead) pool.life[i] = Math.min(pool.life[i], pool.age[i] + 1.2)
        const follow = Math.min(1, dt * 2)
        pool.vx[i] += (Math.sin(time * 0.6 + seed * 20) * 16 + Math.sin(time * 1.7 + seed * 9) * 7 - pool.vx[i]) * follow
        pool.vy[i] += (Math.cos(time * 0.5 + seed * 31) * 11 + Math.sin(time * 1.3 + seed * 5) * 5 - 3 - pool.vy[i]) * follow
        pool.move(i, dt)
        const life = pool.age[i] / pool.life[i]
        const flash = Math.max(0, Math.sin(time * (1.1 + 1.3 * shaderHash(seed, 3)) + seed * Math.PI * 2)) ** 6
        pool.alpha[i] = envelope(life, 0.15, 0.8) * (0.08 + 0.92 * flash)
        return life < 1
      }
      if (rooted(pool, i)) {
        if (line && !line.dead) return true
        if (line) beds.delete(line)
        letGo(pool, i)
      }
      const fall = pool.age[i] / pool.life[i]
      const phase = pool.seed[i] * Math.PI * 2
      if (pool.kind[i] === BLOSSOM) {
        pool.vy[i] = Math.min(pool.vy[i] + 150 * dt, 90)
        pool.vx[i] = (pool.vx[i] + Math.sin(time * 2.6 + phase) * 95 * dt) * (1 - 2 * dt)
        pool.move(i, dt)
        pool.rot[i] += pool.spin[i] * dt * (0.6 + 0.4 * Math.sin(time * 3 + phase))
        pool.alpha[i] = 1 - smooth(clamp01((fall - 0.5) / 0.5))
      } else {
        pool.alpha[i] = 1 - smooth(clamp01(fall))
      }
      return fall < 1
    },
  }
}

export const moss: Preset = {
  name: 'moss',
  pad: [40, 50, 50],
  tint: [0.46, 0.7, 0.1],
  selection: { dark: 'color:#fbf6e4;text-shadow:0 1px 2px rgb(0 0 0 / .85),0 0 10px rgb(0 0 0 / .45)', light: 'color:#1f2a0c' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(8.0, 3.0);
  float reach = age * 700.0 - (local.x + hs.x);
  float spread = reach > 320.0 ? reach : reach + (fbm(world * 0.03 + seed * 5.0) - 0.5) * 120.0;
  float grown = smoothstep(0.0, 70.0, spread);
  float box = sdRBox(local, hs, 9.0);
  float lump = box > 25.0 ? 0.0 : (fbm(world * 0.045 + seed * 11.0) - 0.5) * 9.0;
  float d = box + lump + (1.0 - grown) * (hs.y + 14.0);
  float inside = 0.0;
  vec3 col = vec3(0.0);
  if (d < 7.0) {
    float fuzz = (noise(world * 0.9) - 0.5) * 3.0 + (noise(world * 2.1 + 3.0) - 0.5) * 1.6;
    inside = smoothstep(0.7, -0.7, d + fuzz);
    float mound = fbm(world * 0.05 + seed * 3.0);
    float clump = noise(world * 0.28 + 7.0);
    float shoot = noise(world * 0.62 + 1.0) * 0.7 + noise(world * 1.25 + 5.0) * 0.3;
    float roundOff = smoothstep(0.0, -12.0, d);
    float h = (mound * 0.55 + clump * 0.25 + shoot * 0.2) * (0.7 + 0.3 * roundOff);
    vec3 nrm = normalize(vec3(-dFdx(h) * 2.2, -dFdy(h) * 2.2, 0.35));
    float diff = clamp(dot(nrm, normalize(vec3(-0.6, 0.6, 0.55))), 0.0, 1.0);
    col = mix(mix(vec3(0.07, 0.15, 0.04), vec3(0.56, 0.66, 0.4), uLight), mix(vec3(0.2, 0.38, 0.09), vec3(0.7, 0.79, 0.52), uLight), smoothstep(0.15, 0.55, h));
    col = mix(col, mix(vec3(0.5, 0.66, 0.18), vec3(0.88, 0.93, 0.72), uLight), smoothstep(0.5, 0.85, h) * 0.8);
    col = mix(col, col * vec3(1.15, 0.95, 0.6), smoothstep(0.55, 0.8, fbm(world * 0.02 + 9.0)) * 0.45);
    float lo = mix(0.45, 0.78, uLight);
    col *= lo + (1.3 - lo) * diff;
    col *= mix(0.65, 0.85, uLight) + mix(0.35, 0.15, uLight) * smoothstep(0.1, 0.5, h);
    col += vec3(0.05, 0.07, 0.015) * pow(diff, 8.0) * smoothstep(0.5, 0.8, h);
    col *= mix(0.85, 1.0, uLight);
    vec2 dc = world / 15.0, di = floor(dc), df = fract(dc) - 0.5;
    float dh = hash(di + seed * 3.0);
    if (dh <= 0.07) {
      vec2 o = (hash2(di + 1.7) - 0.5) * 0.45;
      float dr = 0.12 + 0.1 * hash(di + 2.3);
      vec2 dl = (df - o) / dr;
      float dd = length(dl);
      float drop = smoothstep(1.0, 0.8, dd) * roundOff * smoothstep(80.0, 160.0, spread);
      vec3 dropCol = col * 0.55 + vec3(0.06, 0.09, 0.05)
                   + vec3(0.25, 0.35, 0.15) * smoothstep(0.9, 0.2, length(dl - vec2(0.25, 0.3)))
                   + vec3(1.0) * smoothstep(0.32, 0.05, length(dl - vec2(-0.35, -0.35))) * (0.75 + 0.25 * sin(t * 2.0 + dh * 90.0));
      dropCol *= 1.0 - 0.45 * smoothstep(0.7, 1.0, dd);
      col = mix(col, dropCol, drop);
    }
  }
  float top = -hs.y - lump;
  float cell = floor(world.x / 6.0), ch = hash(vec2(cell, seed * 7.0 + 1.0));
  float rooted = step(abs(local.x - world.x + (cell + 0.5) * 6.0), hs.x - 12.0);
  float sh = (5.0 + 7.0 * hash(vec2(cell, 4.0))) * smoothstep(120.0, 260.0, spread) * (1.0 - cover) * rooted;
  float up = top + 2.0 - local.y;
  float xc = (cell + 0.5) * 6.0 + (hash(vec2(cell, 9.0)) - 0.5) * 3.0 + (hash(vec2(cell, 3.0)) - 0.5) * 0.35 * up;
  float stalk = smoothstep(0.8, 0.25, abs(world.x - xc)) * step(0.0, up) * step(up, sh) * step(ch, 0.14);
  float caps = smoothstep(1.0, 0.6, length(vec2((world.x - xc - (hash(vec2(cell, 3.0)) - 0.5) * 0.35 * sh) / 1.4, (up - sh) / 2.2))) * step(ch, 0.14) * step(1.0, sh);
  vec3 stalkC = vec3(0.36, 0.19, 0.09) * (0.75 + 0.4 * hash(vec2(cell, 6.0)));
  vec3 capC = vec3(0.42, 0.3, 0.12) + vec3(0.2, 0.15, 0.05) * smoothstep(0.0, -1.0, world.x - xc);
  float spor = max(stalk, caps);
  float a = max(inside, spor) * smoothstep(0.0, 6.0, 2.0 * hs.y - 2.0 * (1.0 - grown) * (hs.y + 14.0));
  vec3 rgb = col * inside + mix(stalkC, capC, caps) * spor * (1.0 - inside);
  return vec4(rgb * fade, min(a, 1.0) * fade);
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  if (kind > 2.5) {
    float r = length(p);
    float glow = exp(-r * r * 20.0) * 1.5 + exp(-r * 5.5) * 0.4;
    return vec4(vec3(0.8, 1.0, 0.38) * glow * alpha, 0.0);
  }
  if (kind > 1.5) {
    float w = params.x;
    float d = length(vec2(p.x, max(abs(p.y) - 0.8, 0.0))) - w;
    float aa = fwidth(d) * 1.2;
    float inside = smoothstep(aa, -aa, d);
    float u = clamp(p.x / max(w, 0.02), -1.0, 1.0);
    float shade = sqrt(max(1.0 - u * u, 0.0));
    vec3 c = mix(vec3(0.26, 0.40, 0.11), vec3(0.34, 0.46, 0.14), hash(vec2(seed, 2.0)));
    c = mix(c, vec3(0.42, 0.29, 0.13), params.y * 0.7);
    c *= 0.5 + 0.7 * shade * (0.6 + 0.4 * (-u));
    c += vec3(0.07, 0.08, 0.03) * pow(max(0.0, shade - 0.4 * u - 0.5), 2.0);
    float a = inside * alpha;
    return vec4(c * a, a);
  }
  float r = length(p);
  float a = atan(p.y, p.x) + seed * 6.28;
  float aa = fwidth(r) * 1.3;
  float p1 = 0.52 + 0.30 * pow(max(cos(5.0 * a), 0.0), 0.6) + 0.06 * noise(vec2(a * 3.0, seed * 20.0));
  float p2 = 0.40 + 0.24 * pow(max(cos(5.0 * a + 0.628), 0.0), 0.6);
  float m1 = smoothstep(p1 + aa, p1 - aa, r), m2 = smoothstep(p2 + aa, p2 - aa, r);
  float h = hash(vec2(seed, 2.0));
  vec3 edge = h < 0.55 ? vec3(0.99, 0.93, 0.95) : vec3(0.98, 0.80, 0.86);
  vec3 heart = h < 0.55 ? vec3(0.96, 0.66, 0.74) : vec3(0.90, 0.45, 0.60);
  vec3 c1 = mix(heart, edge, smoothstep(0.15, 0.8, r / p1));
  vec3 c2 = mix(heart * 0.9, edge, smoothstep(0.1, 0.8, r / p2));
  float petalShade = 0.85 + 0.15 * cos(5.0 * a);
  vec3 c = mix(c1 * petalShade, c2 * (1.0 + 0.1 * (-p.y)), m2);
  float stam = smoothstep(0.16, 0.10, r);
  float dots = smoothstep(0.3, 0.7, noise(p * 14.0 + seed * 9.0)) * smoothstep(0.2, 0.09, r);
  c = mix(c, vec3(0.98, 0.82, 0.30), stam * 0.9);
  c = mix(c, vec3(0.75, 0.55, 0.15), dots * 0.6);
  c *= 0.9 + 0.15 * (0.5 - 0.5 * p.y);
  float m = max(m1, m2) * alpha;
  return vec4(c * m, m);
}`,
  behavior,
}
