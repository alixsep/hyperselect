import { devtools, mainThreadMs } from '../chrome'
import { deselect, expect, select, test, useDots } from '../helpers'

test('does no work once the effect has settled', async ({ page }) => {
  await useDots(page)
  const cdp = await devtools(page)
  await select(page, '#plain')
  await page.waitForTimeout(1000)
  await deselect(page)
  await page.waitForTimeout(2000)
  const before = await mainThreadMs(cdp)
  await page.waitForTimeout(2000)
  expect((await mainThreadMs(cdp)).task - before.task).toBeLessThan(5)
})
