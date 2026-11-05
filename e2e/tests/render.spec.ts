import { PNG } from 'pngjs'
import { PRESETS, THEMES, changedShare, choose, deselect, effectPixels, expect, openSite, reveal, select, test } from '../helpers'

for (const theme of THEMES) {
  test(`every preset draws behind the selection in the ${theme} theme`, async ({ page }) => {
    await openSite(page, theme)
    await reveal(page, '.lede')
    for (const preset of PRESETS) {
      await deselect(page)
      await choose(page, preset)
      await page.waitForTimeout(900)
      const before = await effectPixels(page, '.lede')
      await select(page, '.lede')
      await page.waitForTimeout(2000)
      expect(changedShare(before, await effectPixels(page, '.lede')), preset).toBeGreaterThan(0.3)
    }
  })
}

test('highlights keep animating presets without particles', async ({ page }) => {
  await openSite(page)
  const button = page.locator('button[data-preset="caustics"]')
  await button.evaluate((element: HTMLElement) => element.click())
  const frame = async (): Promise<Uint8Array> => PNG.sync.read(await button.screenshot()).data
  await page.waitForTimeout(2000)
  const before = await frame()
  await page.waitForTimeout(1000)
  expect(changedShare(before, await frame())).toBeGreaterThan(0.02)
})
