import type { Page } from '@playwright/test'
import { FIXTURE, expect, screenshot, select, test } from '../helpers'

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

const TOLERANCE = 1.5
const SETTLE_MS = 700

const freezeAndScroll = (page: Page, y: number) =>
  page.evaluate((y) => {
    window.requestAnimationFrame = () => 0
    scrollTo(0, y)
  }, y)

function lineBoxes(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const range = getSelection()!.getRangeAt(0)
    const scope = range.commonAncestorContainer.parentNode!.parentNode!
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
    const probe = document.createRange()
    const boxes: Box[] = []
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      if (!node.data.trim() || !range.intersectsNode(node)) continue
      probe.selectNodeContents(node)
      if (node === range.startContainer) probe.setStart(node, range.startOffset)
      if (node === range.endContainer) probe.setEnd(node, range.endOffset)
      const parent = node.parentElement!
      const block = parent.closest<HTMLElement>('p, header')!
      const scale = block.getBoundingClientRect().width / block.offsetWidth || 1
      const lineHeight = parseFloat(getComputedStyle(parent).lineHeight) * scale
      const clip = parent.closest('#scroller, #feed')?.getBoundingClientRect()
      for (const r of probe.getClientRects()) {
        const h = Math.max(r.height, lineHeight)
        const top = r.top + (r.height - h) / 2
        const box = { left: r.left, top, right: r.right, bottom: top + h }
        if (clip) Object.assign(box, { top: Math.max(box.top, clip.top), bottom: Math.min(box.bottom, clip.bottom) })
        if (box.right - box.left >= 1 && box.bottom - box.top >= 1) boxes.push(box)
      }
    }
    const { offsetLeft, offsetTop } = visualViewport!
    const lines: Box[] = []
    for (const box of boxes) {
      Object.assign(box, { left: box.left - offsetLeft, top: box.top - offsetTop, right: box.right - offsetLeft, bottom: box.bottom - offsetTop })
      const center = (box.top + box.bottom) / 2
      const line = lines.find((l) => Math.abs((l.top + l.bottom) / 2 - center) < Math.min(l.bottom - l.top, box.bottom - box.top) / 2)
      if (!line) lines.push(box)
      else Object.assign(line, { left: Math.min(line.left, box.left), top: Math.min(line.top, box.top), right: Math.max(line.right, box.right), bottom: Math.max(line.bottom, box.bottom) })
    }
    return lines
  })
}

async function misplacedPixels(page: Page): Promise<{ covered: number; misplaced: number }> {
  const boxes = await lineBoxes(page)
  const { png, scale } = await screenshot(page)
  const within = (x: number, y: number, grow: number) =>
    boxes.some((b) => x > b.left - grow && x < b.right + grow && y > b.top - grow && y < b.bottom + grow)
  let covered = 0
  let misplaced = 0
  for (let py = 0; py < png.height; py++) {
    for (let px = 0; px < png.width; px++) {
      const o = (py * png.width + px) * 4
      const painted = png.data[o]! > 180 && png.data[o + 1]! < 120 && png.data[o + 2]! > 180
      const x = (px + 0.5) / scale
      const y = (py + 0.5) / scale
      if (painted) covered++
      if (painted ? !within(x, y, TOLERANCE) : within(x, y, -TOLERANCE)) misplaced++
    }
  }
  return { covered, misplaced }
}

async function expectAligned(page: Page): Promise<void> {
  await page.waitForTimeout(SETTLE_MS)
  const { covered, misplaced } = await misplacedPixels(page)
  expect(covered).toBeGreaterThan(500)
  expect(misplaced).toBe(0)
}

test.beforeEach(async ({ page }) => {
  await page.goto(FIXTURE)
  await page.evaluate(() => document.fonts.ready)
})

test('covers a paragraph at the top of the page', async ({ page }) => {
  await select(page, '#plain')
  await expectAligned(page)
})

test('covers a partial selection across inline styles', async ({ page }) => {
  await page.evaluate(() => {
    const paragraph = document.querySelector('#mixed')!
    const range = document.createRange()
    range.setStart(paragraph.firstChild!, 12)
    range.setEnd(paragraph.querySelector('code')!.firstChild!, 6)
    getSelection()!.removeAllRanges()
    getSelection()!.addRange(range)
  })
  await expectAligned(page)
})

test('covers right-to-left text', async ({ page }) => {
  await select(page, '#rtl')
  await expectAligned(page)
})

test('stays inside a scrolled container', async ({ page }) => {
  await page.evaluate(() => (document.querySelector('#scroller')!.scrollTop = 70))
  await select(page, '#scroller')
  await expectAligned(page)
})

test('follows scaled content', async ({ page }) => {
  await select(page, '#scaled')
  await expectAligned(page)
})

test('covers text far down the page', async ({ page }) => {
  await page.evaluate(() => document.querySelector('#deep')!.scrollIntoView({ block: 'center' }))
  await select(page, '#deep')
  await expectAligned(page)
})

test('covers text scrolled into view horizontally', async ({ page }) => {
  await page.evaluate(() => {
    const paragraph = document.querySelector<HTMLElement>('#plain')!
    paragraph.style.marginLeft = '1400px'
    paragraph.scrollIntoView({ inline: 'center' })
  })
  await select(page, '#plain')
  await expectAligned(page)
})

test('stays sharp and in place when pinch-zoomed', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Pinch zoom is emulated through the Chrome DevTools Protocol')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2.5 })
  await select(page, '#mixed')
  await expectAligned(page)
})

test('follows the text when the page scrolls after selecting', async ({ page }) => {
  await select(page, '#deep')
  await page.waitForTimeout(SETTLE_MS)
  await page.evaluate(() => document.querySelector('#deep')!.scrollIntoView({ block: 'center' }))
  await expectAligned(page)
})

test('stays on the text while scrolling before the next frame is drawn', async ({ page }) => {
  await select(page, '#mixed')
  await page.waitForTimeout(SETTLE_MS)
  await freezeAndScroll(page, 120)
  await expectAligned(page)
})

test('follows reflowed text when the viewport resizes', async ({ page }) => {
  await select(page, '#plain')
  await page.waitForTimeout(SETTLE_MS)
  const { width, height } = page.viewportSize()!
  await page.setViewportSize({ width: Math.round(width * 0.6), height })
  await expectAligned(page)
})

test('follows text pushed down by new content', async ({ page }) => {
  await select(page, '#mixed')
  await page.waitForTimeout(SETTLE_MS)
  await page.evaluate(() => document.querySelector('#plain')!.before(Object.assign(document.createElement('div'), { style: 'height:150px' })))
  await expectAligned(page)
})

test('follows text moved by a style change with no DOM mutation', async ({ page }) => {
  await select(page, '#plain')
  await page.waitForTimeout(SETTLE_MS)
  await page.hover('#plain')
  await expectAligned(page)
})

test('draws over a painted, scaled and translated card', async ({ page }) => {
  await page.evaluate(() => document.querySelector('#card')!.scrollIntoView({ block: 'center' }))
  await select(page, '#card')
  await expectAligned(page)
})

test('draws over a sticky header and stays with it while the page scrolls', async ({ page }) => {
  await page.evaluate(() => (document.querySelector<HTMLElement>('#sticky')!.hidden = false))
  await select(page, '#sticky')
  await page.waitForTimeout(SETTLE_MS)
  await freezeAndScroll(page, 400)
  await expectAligned(page)
})

test('draws over a modal dialog and stays with it while the page scrolls', async ({ page }) => {
  await page.evaluate(() => document.querySelector<HTMLDialogElement>('#modal')!.showModal())
  await select(page, '#modal')
  await page.waitForTimeout(SETTLE_MS)
  await freezeAndScroll(page, 400)
  await expectAligned(page)
})

test('draws over painted items in a positioned scrolling box and follows its scroll', async ({ page }) => {
  await page.evaluate(() => document.querySelector('#feed')!.scrollIntoView({ block: 'center' }))
  await select(page, '#feed')
  await page.waitForTimeout(SETTLE_MS)
  await page.evaluate(() => (document.querySelector('#feed')!.scrollTop = 40))
  await expectAligned(page)
})

test('leaves rotated and vertical text to the native highlight', async ({ page }) => {
  for (const selector of ['#tilted', '#vertical']) {
    await select(page, selector)
    await page.waitForTimeout(SETTLE_MS)
    expect(await page.getAttribute(selector, 'data-hyperselect-selected')).toBe('native')
    expect((await misplacedPixels(page)).covered).toBe(0)
  }
})
