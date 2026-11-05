import type { CDPSession, Page } from '@playwright/test'

export async function devtools(page: Page): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  return cdp
}

export function frameTimes(page: Page, ms: number): Promise<number[]> {
  return page.evaluate(
    (ms) =>
      new Promise<number[]>((resolve) => {
        const frames: number[] = []
        let last = performance.now()
        const end = last + ms
        const step = (now: number) => {
          frames.push(now - last)
          last = now
          if (now < end) requestAnimationFrame(step)
          else resolve(frames.slice(2))
        }
        requestAnimationFrame(step)
      }),
    ms,
  )
}

export async function mainThreadMs(cdp: CDPSession): Promise<{ task: number; script: number }> {
  const { metrics } = await cdp.send('Performance.getMetrics')
  const value = (name: string) => metrics.find((m) => m.name === name)!.value * 1000
  return { task: value('TaskDuration'), script: value('ScriptDuration') }
}

export async function heapMb(cdp: CDPSession): Promise<number> {
  await cdp.send('HeapProfiler.collectGarbage')
  const { metrics } = await cdp.send('Performance.getMetrics')
  return metrics.find((m) => m.name === 'JSHeapUsedSize')!.value / 2 ** 20
}

export function cpuBenchmarkMs(page: Page): Promise<number> {
  return page.evaluate(() => {
    const state = new Float32Array(4 * 50_000)
    const run = (): number => {
      const start = performance.now()
      for (let step = 0; step < 40; step++) {
        for (let i = 0; i < state.length; i += 4) {
          state[i] = state[i]! + Math.sin(state[i + 1]! + step) * 0.01
          state[i + 1] = state[i + 1]! + Math.cos(state[i]!) * 0.01
          state[i + 2] = state[i]! * state[i + 1]!
        }
      }
      return performance.now() - start
    }
    return Math.min(...Array.from({ length: 7 }, run))
  })
}

export function gpuName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    return gl && info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'unknown GPU'
  })
}

export const percentile = (values: number[], p: number): number => [...values].sort((a, b) => a - b)[Math.floor(values.length * p)]!
