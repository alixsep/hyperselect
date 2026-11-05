import { expect, screenshot, select, test, useDots } from '../helpers'

test('runs a custom preset with its own particles', async ({ page }) => {
  await useDots(page)
  await select(page, '#plain')
  await page.waitForTimeout(600)
  const { png } = await screenshot(page)
  let green = 0
  for (let o = 0; o < png.data.length; o += 4) if (png.data[o + 1]! > 200 && png.data[o]! < 80 && png.data[o + 2]! < 80) green++
  expect(green).toBeGreaterThan(200)
})
