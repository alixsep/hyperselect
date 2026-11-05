import { devtools, heapMb, mainThreadMs } from '../chrome'
import { PRESETS, changedShare, choose, deselect, effectPixels, expect, openSite, reveal, select, test } from '../helpers'

test.beforeEach(async ({ page }) => {
  await openSite(page)
  await reveal(page, '.lede')
})

test('does not leak memory across selections and preset switches', async ({ page }) => {
  const cdp = await devtools(page)
  const baseline = await heapMb(cdp)
  for (let n = 0; n < 42; n++) {
    await choose(page, PRESETS[n % PRESETS.length]!)
    await select(page, n % 2 ? '.lede' : 'article')
    await page.waitForTimeout(250)
    await deselect(page)
    await page.waitForTimeout(100)
  }
  await page.waitForTimeout(5000)
  expect((await heapMb(cdp)) - baseline).toBeLessThan(1)
})

test('recovers when the WebGL context is lost', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    Object.assign(HTMLCanvasElement.prototype, {
      getContext(this: HTMLCanvasElement, ...args: Parameters<typeof getContext>) {
        const context = getContext.apply(this, args)
        if (args[0] === 'webgl2') Object.assign(window, { gl: context })
        return context
      },
    })
  })
  await page.reload()
  await reveal(page, '.lede')
  await page.waitForTimeout(900)
  const before = await effectPixels(page, '.lede')
  await page.evaluate(async () => {
    const lose = (window as unknown as { gl: WebGL2RenderingContext }).gl.getExtension('WEBGL_lose_context')!
    lose.loseContext()
    await new Promise((resolve) => setTimeout(resolve, 200))
    lose.restoreContext()
  })
  await select(page, '.lede')
  await page.waitForTimeout(1500)
  expect(changedShare(before, await effectPixels(page, '.lede'))).toBeGreaterThan(0.3)
})

test('keeps surfaces but drops particles for reduced motion', async ({ page }) => {
  const cdp = await devtools(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await choose(page, 'fire')
  await page.waitForTimeout(900)
  const before = await effectPixels(page, '.lede')
  await select(page, '.lede')
  await page.waitForTimeout(1500)
  const start = await mainThreadMs(cdp)
  await page.waitForTimeout(1000)
  const end = await mainThreadMs(cdp)
  expect(changedShare(before, await effectPixels(page, '.lede'))).toBeGreaterThan(0.3)
  expect(end.script - start.script).toBeLessThan(40)
})
