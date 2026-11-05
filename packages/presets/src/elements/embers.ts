import type { Behavior, Preset } from 'hyperselect'
import { between, envelope, random } from '../math'
import { accumulator } from '../shared'

function behavior(): Behavior {
  const sparks = accumulator(12)

  return {
    emit(line, { pool, dt }) {
      const kindled = Math.min(line.w, Math.max(0, line.age * 500 - 60))
      for (let n = sparks(line, kindled * 0.028 * dt); n > 0; n--) {
        const i = pool.spawn(line.id)
        if (i < 0) return
        pool.x[i] = line.x + random() * kindled
        pool.y[i] = line.y + line.h * between(0.1, 0.6)
        pool.vx[i] = between(-8, 8)
        pool.vy[i] = between(-55, -22)
        pool.life[i] = between(1.3, 2.8)
        pool.size[i] = between(3, 5.5)
      }
    },

    update(i, { pool, dt, time }) {
      const life = pool.age[i] / pool.life[i]
      const seed = pool.seed[i]
      pool.vx[i] = (pool.vx[i] + Math.sin(time * 2.3 + seed * 31) * 60 * dt) * (1 - 1.2 * dt)
      pool.vy[i] *= 1 - 0.5 * dt
      pool.move(i, dt)
      pool.alpha[i] = envelope(life, 0.08, 0.4) * (0.65 + 0.35 * Math.sin(time * 9 + seed * 60))
      return life < 1
    },
  }
}

export const embers: Preset = {
  name: 'embers',
  pad: [16, 10, 16],
  tint: [0.96, 0.34, 0.1],
  selection: { dark: 'color:#fff4ea;text-shadow:0 1px 2px rgb(0 0 0 / .95)', light: 'color:#1e0a04' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 hs = halfSize + vec2(5.0, 2.0);
  float d = sdRBox(local, hs, 7.0) + (fbm3(world * 0.05 + seed * 8.0) - 0.5) * 5.0;
  float aa = fwidth(d);
  float inside = smoothstep(aa, -aa, d);
  float blown = age * 450.0 - (local.x + hs.x);
  float kindled = smoothstep(0.0, 80.0, blown);
  float g = fbm(world * vec2(0.022, 0.04) + vec2(t * 0.04, -t * 0.06) + seed * 6.0);
  float breath = 0.7 + 0.3 * sin(t * 0.9 + g * 7.0 + seed * 9.0);
  float halo = exp(-max(d, 0.0) / 10.0) * (1.0 - inside) * kindled * breath;
  vec4 under = vec4(mix(vec3(0.55, 0.08, 0.0), vec3(0.95, 0.5, 0.3), uLight) * halo * 0.4, halo * mix(0.12, 0.22, uLight));
  if (inside <= 0.0) return under * fade;
  float wave = exp(-abs(blown - 60.0) / 45.0);
  float glow = (smoothstep(0.42, 0.78, g) * breath + wave * 0.5) * kindled;
  vec2 cell = world / 5.0, id = floor(cell);
  float h = hash(id + seed * 5.0);
  float r = length(fract(cell) - 0.5 - (hash2(id + 3.3) - 0.5) * 0.5);
  float twinkle = 0.5 + 0.5 * sin(t * (0.8 + 2.0 * h) + h * 50.0);
  float speck = step(h, 0.22) * smoothstep(0.3, 0.08, r) * twinkle * smoothstep(0.25, 0.6, g) * kindled;
  float grain = noise(world * 0.7) * 0.5 + noise(world * 0.23 + 3.0) * 0.5;
  float ash = smoothstep(0.45, 0.75, fbm3(world * 0.06 + 11.0)) * (1.0 - glow);
  vec3 coal = mix(vec3(0.045, 0.035, 0.035), vec3(0.62, 0.58, 0.56), uLight) * (0.75 + 0.5 * grain);
  coal = mix(coal, mix(vec3(0.2, 0.19, 0.19), vec3(0.82, 0.8, 0.78), uLight), ash * 0.6);
  float heat = clamp(glow * (0.5 + 0.5 * grain) + speck, 0.0, 1.0);
  vec3 hot = mix(vec3(0.5, 0.05, 0.0), vec3(1.0, 0.36, 0.05), smoothstep(0.15, 0.6, heat));
  hot = mix(hot, vec3(1.0, 0.75, 0.38), smoothstep(0.75, 1.0, heat));
  vec3 col = mix(coal, hot, smoothstep(0.0, 0.7, heat) * mix(1.0, 0.85, uLight));
  vec4 c = vec4(col * inside, inside * mix(0.94, 0.9, uLight));
  c.rgb += hot * speck * inside * mix(0.6, 0.0, uLight);
  return (c + under * (1.0 - inside)) * fade;
}`,
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float r2 = dot(p, p);
  float core = exp(-r2 * 9.0), halo = exp(-r2 * 2.2) * 0.3;
  vec3 c = mix(vec3(1.0, 0.75, 0.35), vec3(1.0, 0.38, 0.05), smoothstep(0.0, 0.4, life));
  c = mix(c, vec3(0.6, 0.06, 0.0), smoothstep(0.5, 1.0, life));
  return vec4(c * (core * 1.5 + halo) * alpha, 0.0);
}`,
  behavior,
}
