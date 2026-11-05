export const twinkle: string = /* glsl */ `
float twinkle(vec2 p, float spikes) {
  vec2 a = abs(p);
  float rays = exp(-a.x * spikes) * exp(-a.y * 2.2) + exp(-a.y * spikes) * exp(-a.x * 2.2);
  return rays + exp(-dot(p, p) * 18.0) * 1.4;
}
`
