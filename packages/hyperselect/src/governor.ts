const STEPS = [1, 0.75]
const FRAME_MS = 1000 / 60
const SLOW_MS = 22
const FAST_MS = 18
const SETTLE_MS = 600
const PATIENCE_MS = 3000
const GAP_MS = 250
const SMOOTHING = 0.1

export class Governor {
  scale: number = STEPS[0]!
  private level = 0
  private average = FRAME_MS
  private settle = SETTLE_MS
  private calm = 0
  private patience = PATIENCE_MS
  private raised = false

  sample(ms: number): void {
    if (ms <= 0 || ms > GAP_MS) return
    this.average += (ms - this.average) * SMOOTHING
    if ((this.settle -= ms) > 0) return
    if (this.average > SLOW_MS) {
      if (this.level < STEPS.length - 1) this.shift(1)
      return
    }
    this.calm = this.average < FAST_MS ? this.calm + ms : 0
    if (this.calm > this.patience && this.level > 0) this.shift(-1)
  }

  private shift(step: number): void {
    if (step > 0 && this.raised) this.patience *= 2
    this.raised = step < 0
    this.level += step
    this.scale = STEPS[this.level]!
    this.average = FRAME_MS
    this.settle = SETTLE_MS
    this.calm = 0
  }
}
