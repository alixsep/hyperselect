import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const puffs = accumulator(5)

  return {
    emit(line, { pool, dt }) {
      const dusted = Math.min(line.w, Math.max(0, line.age * 500 - 40))
      for (let n = puffs(line, dusted * 0.01 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * dusted
        pool.y[i] = line.y + line.h * between(0, 0.9)
        pool.vx[i] = between(-6, 10)
        pool.vy[i] = between(-14, -4)
        pool.life[i] = between(3, 5)
        pool.size[i] = between(3, 5)
        pool.rot[i] = random() * Math.PI * 2
        pool.spin[i] = between(-0.6, 0.6)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      pool.vx[i] += (Math.sin(time * 0.8 + seed * 17) * 10 - pool.vx[i] * 0.3) * dt
      pool.vy[i] += (Math.cos(time * 0.6 + seed * 29) * 6 - 2 - pool.vy[i] * 0.2) * dt
      pool.move(i, dt)
      pool.rot[i] += pool.spin[i] * dt
      pool.alpha[i] = envelope(life, 0.15, 0.6) * 0.9
      return life < 1
    },
  }
}

export const pollen: Preset = {
  name: 'pollen',
  pad: [14, 14, 12],
  tint: [0.98, 0.78, 0.22],
  selection: { dark: 'color:#fffbea;text-shadow:0 1px 2px rgb(60 35 0 / .9)', light: 'color:#2e2200' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(4.0, 2.0);
  float band = sdRBox(local, hs, 10.0);
  if (band > 14.0) return vec4(0.0);
  vec2 flow = vec2(t * 0.09, -t * 0.04);
  float wisp = fbm(world * 0.035 + flow + seed * 5.0);
  float x = local.x + hs.x;
  float dusted = smoothstep(-50.0, 10.0, age * 500.0 - x + (wisp - 0.5) * 60.0);
  float dust = smoothstep(7.0, -5.0, band + (wisp - 0.5) * 14.0) * dusted;
  if (dust <= 0.0) return vec4(0.0);
  float dense = fbm(world * vec2(0.018, 0.05) + flow * 0.6 + seed * 2.0);
  float powder = 0.6 + 0.6 * smoothstep(0.3, 0.75, dense);
  vec3 haze = mix(mix(vec3(0.42, 0.28, 0.04), vec3(0.62, 0.44, 0.08), dense), mix(vec3(1.0, 0.9, 0.56), vec3(0.99, 0.82, 0.4), dense), uLight);
  vec4 col = vec4(haze, 1.0) * dust * min(powder, 1.0) * mix(0.66, 0.62, uLight);
  vec2 cell = floor(world / 4.0);
  float h = hash(cell + seed * 7.0);
  vec2 spot = (cell + 0.25 + 0.5 * hash2(cell + 3.0)) * 4.0;
  float twinkle = 0.55 + 0.45 * sin(t * (0.5 + 1.2 * h) + h * 40.0);
  float speck = step(h, 0.3) * smoothstep(0.6 + 0.5 * h, 0.1, length(world - spot)) * dust;
  vec3 grainTone = mix(vec3(1.0, 0.82, 0.32) * (0.7 + 0.5 * twinkle), vec3(0.78, 0.52, 0.06), uLight);
  col = over(col, grainTone, speck * mix(0.8, 0.7, uLight));
  vec2 coarse = floor(world / 13.0);
  float ch = hash(coarse + seed * 3.0);
  vec2 cp = world - (coarse + 0.5 + (hash2(coarse + 9.0) - 0.5) * 0.5) * 13.0;
  float spikes = 1.9 + 0.35 * smoothstep(0.2, 0.9, abs(sin(atan(cp.y, cp.x) * 6.0 + ch * 20.0)));
  float grain = smoothstep(0.6, -0.6, length(cp) - spikes * smoothstep(0.1, 0.6, dust)) * step(0.76, ch);
  float lit = 0.75 + 0.35 * smoothstep(1.5, -1.5, cp.x + cp.y);
  vec3 grainBody = mix(vec3(0.95, 0.7, 0.18), vec3(0.86, 0.6, 0.1), uLight) * lit;
  col = over(col, grainBody, grain * 0.92);
  return col * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r = length(p);
  float spikes = 0.95 + 0.22 * smoothstep(0.3, 1.0, abs(sin(atan(p.y, p.x) * 6.0 + seed * 20.0)));
  float d = r - spikes;
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float lit = 0.72 + 0.4 * smoothstep(1.0, -1.0, p.x - p.y);
  vec3 c = mix(vec3(1.0, 0.76, 0.2), vec3(0.88, 0.6, 0.1), uLight) * lit;
  c = mix(c, c * 0.75, smoothstep(0.2, 0.0, abs(r - 0.55)) * 0.4);
  float glow = exp(-r * r * 1.4) * (1.0 - inside) * (1.0 - uLight) * 0.35;
  float a = inside * alpha;
  return vec4(c * a + vec3(1.0, 0.75, 0.25) * glow * alpha, a);
}`,
  behavior,
}
