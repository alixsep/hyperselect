const WINDOW_MS = 1000

interface LongFrame extends PerformanceEntry {
  readonly styleAndLayoutStart: number
  readonly scripts: readonly PerformanceEntry[]
}

function resolution(): string {
  const layer = [...document.documentElement.children].find((child) => child instanceof HTMLCanvasElement)
  const width = layer?.getBoundingClientRect().width
  return layer && width ? `${(layer.width / width).toFixed(2)}×` : 'idle'
}

export function showStats(): void {
  const panel = document.createElement('output')
  panel.id = 'stats'
  document.body.append(panel)
  const frames: number[] = []
  let last = performance.now()
  let since = last
  let script = 0
  let render = 0

  if (PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
    new PerformanceObserver((list) => {
      for (const frame of list.getEntries() as LongFrame[]) {
        for (const entry of frame.scripts) script += entry.duration
        if (frame.styleAndLayoutStart) render += frame.startTime + frame.duration - frame.styleAndLayoutStart
      }
    }).observe({ type: 'long-animation-frame', buffered: false })
  }

  const tick = (now: number): void => {
    frames.push(now - last)
    last = now
    if (now - since >= WINDOW_MS) {
      frames.sort((a, b) => a - b)
      const seconds = (now - since) / 1000
      const fps = Math.round(frames.length / seconds)
      const p95 = frames[Math.floor(frames.length * 0.95)]!
      const busy = `script ${Math.round(script / seconds)} · layout+paint ${Math.round(render / seconds)} ms/s`
      panel.textContent = `${fps} fps · p95 ${p95.toFixed(1)} ms · render ${resolution()} · dpr ${devicePixelRatio.toFixed(2)}\n${busy}`
      frames.length = 0
      since = now
      script = 0
      render = 0
    }
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
