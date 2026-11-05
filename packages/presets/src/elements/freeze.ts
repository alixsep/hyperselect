import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const vapor = accumulator(40)

  return {
    emit(line, { pool, dt }) {
      const formed = Math.min(line.w, Math.max(0, line.age * 900 - 40))
      for (let n = vapor(line, formed * 0.055 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        const r = random()
        pool.x[i] = line.x + random() * formed
        if (r < 0.7) {
          pool.y[i] = line.y + line.h + between(2, 8)
          pool.vx[i] = between(-9, 9)
          pool.vy[i] = between(6, 18)
        } else if (r < 0.85) {
          pool.y[i] = line.y + between(-6, 2)
          pool.vx[i] = between(-10, 10)
          pool.vy[i] = between(-4, 3)
        } else {
          const side = random() < 0.5 ? -1 : 1
          pool.x[i] = side < 0 ? line.x - 6 : line.x + formed + 6
          pool.y[i] = line.y + random() * line.h
          pool.vx[i] = side * between(4, 12)
          pool.vy[i] = between(2, 10)
        }
        pool.base[i] = between(22, 48)
        pool.life[i] = between(2.6, 4.8)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-0.25, 0.25)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      pool.vy[i] += 5 * dt
      pool.vx[i] = (pool.vx[i] + Math.sin(time * 0.7 + pool.seed[i] * 9) * 9 * dt) * (1 - 0.4 * dt)
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.size[i] = pool.base[i] * (0.45 + 1.4 * life)
      pool.alpha[i] = envelope(life, 0.25, 0.45) * 0.32
      return life < 1
    },
  }
}

export const freeze: Preset = {
  name: 'freeze',
  pad: [80, 70, 110],
  tint: [0.62, 0.72, 0.8],
  selection: { dark: 'color:#f6fcff', light: 'color:#0d2a3d' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 3.0);
  float rd = 6.0;
  float jag = (fbm(world * 0.07 + seed * 21.0) - 0.5) * 7.0 + (noise(world * 0.35 + 5.0) - 0.5) * 1.5;
  float d2 = sdRBox(local, hs, rd) + jag;
  float inSlab = smoothstep(1.0, -1.0, d2);
  float reach = age * 900.0 - hs.x - 40.0 - local.x;
  float fx = reach > 90.0 ? -reach : (fbm(world * 0.06 + 9.0) - 0.5) * 70.0 - reach;
  float formed = smoothstep(16.0, -16.0, fx);
  float sh = exp(-max(sdRBox(local - vec2(3.0, 5.0), hs, rd) + jag, 0.0) / 7.0) * (1.0 - inSlab) * formed * mix(0.55, 0.12, uLight);
  float hz = fbm(world * 0.035 + vec2(t * 0.06, t * 0.12));
  float haze = exp(-max(d2, 0.0) / (14.0 + 22.0 * hz)) * (1.0 - inSlab) * formed * (0.25 + 0.75 * hz) * (0.6 + 0.4 * smoothstep(-hs.y, hs.y, local.y)) * 0.28;
  vec3 mist = vec3(0.0, 0.01, 0.03) * sh + mix(vec3(0.8, 0.88, 0.97), vec3(0.86, 0.9, 0.94), uLight) * haze;
  if (inSlab == 0.0) return vec4(mist * fade, min(sh + haze, 1.0) * fade);
  float frontGlow = exp(-abs(fx) / 9.0) * (1.0 - smoothstep(2.0 * hs.x + 60.0, 2.0 * hs.x + 120.0, age * 900.0));
  float slab = inSlab * formed;
  float body = 0.55 + 0.45 * fbm(world * 0.035 + 3.0);
  float streak = 0.85 + 0.15 * noise(vec2(world.x * 0.02 + world.y * 0.05, world.y * 0.008 + 4.0));
  float grad = 0.7 + 0.3 * smoothstep(hs.y, -hs.y, local.y);
  float edge = -d2;
  vec2 nrm = local - clamp(local, -(hs - rd), hs - rd);
  nrm = normalize(nrm + vec2(1e-4, 0.0));
  float rim = smoothstep(5.0, 0.0, edge);
  float lit = clamp(dot(nrm, normalize(vec2(-0.55, -1.0))) * 0.5 + 0.5, 0.0, 1.0);
  float bevel = rim * (0.15 + 0.85 * lit);
  float rimLine = smoothstep(1.6, 0.0, abs(edge - 0.8)) * 0.5;
  float sweep = pow(smoothstep(0.42, 0.0, abs(fract((world.x * 0.6 + world.y) * 0.0011 - t * 0.05) - 0.5)), 3.0);
  vec2 cp = world * 0.03 + 13.0;
  cp += (vec2(fbm3(world * 0.09 + 1.0), fbm3(world * 0.09 + 4.0)) - 0.5) * 0.35;
  vec3 v = voronoi(cp);
  float localForm = (local.x + hs.x + 40.0) / 900.0;
  float cellDelay = 0.55 + 1.6 * hash(vec2(v.z, 3.0));
  float reveal = smoothstep(0.0, 0.35, age - localForm - cellDelay);
  float keep = step(0.55, hash(vec2(v.z, 11.0)));
  float crackW = v.y - v.x;
  float crack = smoothstep(0.07, 0.012, crackW) * reveal * keep;
  vec3 vs = voronoi(cp - vec2(0.04, 0.05));
  float crackSh = smoothstep(0.08, 0.015, vs.y - vs.x) * reveal * step(0.55, hash(vec2(vs.z, 11.0)));
  float crackEdge = smoothstep(0.0, 4.0, edge);
  crack *= crackEdge;
  crackSh *= crackEdge;
  float frostRim = edge < 16.0 ? smoothstep(16.0, 0.0, edge) * fbm(world * 0.22 + 5.0) * 0.8 : 0.0;
  float frostCrack = crackW < 0.2 && reveal * keep > 0.0 ? smoothstep(0.2, 0.03, crackW) * reveal * keep * fbm(world * 0.3 + 1.0) * 0.6 : 0.0;
  float sparkle = pow(noise(world * 0.9 + 11.0), 12.0) * (0.5 + 0.5 * sin(t * 4.0 + hash(floor(world * 0.45)) * 6.28));
  vec3 tint = mix(vec3(0.6, 0.83, 1.0), vec3(0.9, 0.94, 0.97), uLight);
  float a = slab * ((0.5 + 0.2 * uLight) * body * streak * grad + bevel * 0.35 + frostRim * 0.45 + frostCrack * 0.5) + crack * 0.4 + crackSh * 0.3;
  vec3 rgb = tint * slab * (0.5 * body * streak * grad) * mix(1.15, 1.7, uLight)
           + vec3(0.9, 0.96, 1.0) * slab * (bevel * 0.45 + rimLine + sweep * 0.2 + frostRim * 0.5 + frostCrack * 0.6)
           + vec3(1.0) * slab * (sparkle * 0.9)
           + vec3(0.97, 0.99, 1.0) * crack * 0.8
           + vec3(0.02, 0.05, 0.1) * crackSh * 0.35
           + vec3(0.85, 0.95, 1.0) * frontGlow * inSlab * mix(0.7, 1.2, uLight);
  a += sh + haze;
  rgb += mist;
  a = min(a, 1.0);
  return vec4(rgb * fade, a * fade);
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  vec2 q = p * vec2(1.0, 1.25);
  float n1 = fbm(q * 1.1 + seed * 13.0 + vec2(t * 0.07, t * 0.05));
  float n2 = fbm(q * 2.6 - seed * 7.0 + vec2(-t * 0.09, t * 0.04));
  float r = length(q) + (n1 - 0.5) * 1.3 + (n2 - 0.5) * 0.35;
  float disc = smoothstep(1.0, 0.05, r);
  float dens = disc * (0.35 + 0.65 * n2) * (0.6 + 0.4 * n1);
  float a = dens * alpha;
  vec3 c = mix(mix(vec3(0.72, 0.82, 0.95), vec3(0.93, 0.97, 1.0), n2), mix(vec3(0.84, 0.88, 0.92), vec3(0.92, 0.95, 0.97), n2), uLight);
  return vec4(c * a, a * 0.85);
}`,
  behavior,
}
