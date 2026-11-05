import { createHyperSelect, type Preset } from 'hyperselect'

const block: Preset = {
  name: 'block',
  pad: [4, 4, 4],
  tint: [1, 0, 1],
  selection: { dark: 'color:transparent', light: 'color:transparent' },
  surface: /* glsl */ `
vec4 surface(float t, float age, float fade, float seed, float cover) {
  vec2 d = abs(local) - halfSize;
  return vec4(1.0, 0.0, 1.0, 1.0) * fade * step(max(d.x, d.y), 0.0);
}`,
}

const dots: Preset = {
  name: 'dots',
  pad: [0, 0, 0],
  tint: [0, 1, 0],
  selection: { dark: '', light: '' },
  surface: 'vec4 surface(float t, float age, float fade, float seed, float cover) { return vec4(0.0); }',
  sprite: /* glsl */ `
vec4 sprite(vec2 p, float life, float alpha, float seed, float kind, float t) {
  float a = step(length(p), 0.9) * alpha;
  return vec4(uTint * a, a);
}`,
  behavior: () => ({
    emit(line, { pool }) {
      const i = pool.spawn(line.id)
      if (i < 0) return
      pool.x[i] = line.x + Math.random() * line.w
      pool.y[i] = line.y
      pool.vy[i] = -40
      pool.size[i] = 12
      pool.life[i] = 1
    },
    update(i, { pool, dt }) {
      pool.move(i, dt)
      return pool.age[i] < pool.life[i]
    },
  }),
}

Object.assign(window, { hyperselect: createHyperSelect({ preset: block, theme: 'dark' }), dots })
