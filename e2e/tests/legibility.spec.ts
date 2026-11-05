import type { Page } from '@playwright/test'
import { PRESETS, THEMES, choose, deselect, expect, openSite, reveal, screenshot, test } from '../helpers'

const MOMENTS_MS = [400, 800, 1600, 3000]
const MIN_CONTRAST = 3
const MAX_UNREADABLE = 0.02
const STROKE_PX = 2

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

const luminance = (c: number[]) => {
  const [r, g, b] = c.map((v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

function selectLede(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const text = document.querySelector('.lede')!.firstChild!
    const range = document.createRange()
    range.setStart(text, 40)
    range.setEnd(text, text.textContent!.length)
    getSelection()!.removeAllRanges()
    getSelection()!.addRange(range)
    return [...range.getClientRects()].map((r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom }))
  })
}

async function unreadableShare(page: Page, boxes: Box[]): Promise<number> {
  const ink = await page.evaluate(() => {
    document.querySelector('main')!.style.visibility = 'hidden'
    return getComputedStyle(document.querySelector('.lede')!, '::selection').color.match(/\d+/g)!.slice(0, 3).map(Number)
  })
  const { png, scale } = await screenshot(page)
  await page.evaluate(() => (document.querySelector('main')!.style.visibility = ''))
  const { width, height } = png
  const inkLuminance = luminance(ink)
  const glyphs = new Uint8Array(width * height)
  const unreadable = new Uint8Array(width * height)
  for (const box of boxes) {
    for (let y = Math.ceil(box.top * scale); y < box.bottom * scale; y++) {
      for (let x = Math.ceil(box.left * scale); x < box.right * scale; x++) {
        const i = y * width + x
        const behind = luminance([png.data[i * 4]!, png.data[i * 4 + 1]!, png.data[i * 4 + 2]!])
        glyphs[i] = 1
        unreadable[i] = Number((Math.max(behind, inkLuminance) + 0.05) / (Math.min(behind, inkLuminance) + 0.05) < MIN_CONTRAST)
      }
    }
  }
  const patches = erode(erode(unreadable, width, height, Math.round(STROKE_PX * scale), 1), width, height, Math.round(STROKE_PX * scale), width)
  let total = 0
  let lost = 0
  for (let i = 0; i < glyphs.length; i++) {
    total += glyphs[i]!
    lost += patches[i]!
  }
  return lost / total
}

function erode(mask: Uint8Array, width: number, height: number, radius: number, step: number): Uint8Array {
  const out = new Uint8Array(mask.length)
  const length = step === 1 ? width : height
  for (let line = 0; line < (step === 1 ? height : width); line++) {
    const start = step === 1 ? line * width : line
    let run = 0
    for (let n = 0; n < length; n++) {
      run = mask[start + n * step] ? run + 1 : 0
      if (run > 2 * radius) out[start + (n - radius) * step] = 1
    }
  }
  return out
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await openSite(page, theme)
      await reveal(page, '.lede')
    })

    for (const preset of PRESETS) {
      test(`${preset} keeps selected text readable while it animates`, async ({ page }) => {
        await choose(page, preset)
        await page.waitForTimeout(600)
        await deselect(page)
        const boxes = await selectLede(page)
        let elapsed = 0
        const shares: number[] = []
        for (const moment of MOMENTS_MS) {
          await page.waitForTimeout(moment - elapsed)
          elapsed = moment
          shares.push(await unreadableShare(page, boxes))
        }
        expect(Math.max(...shares), `unreadable share at ${MOMENTS_MS.join(', ')} ms: ${shares.join(', ')}`).toBeLessThan(MAX_UNREADABLE)
      })
    }
  })
}
