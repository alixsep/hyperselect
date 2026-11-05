import { test as base, expect, type Page } from '@playwright/test'
import type { HyperSelect, Preset } from 'hyperselect'
import { PNG } from 'pngjs'

export const SITE = 'http://localhost:4610'
export const FIXTURE = 'http://localhost:4611'
export const PRESETS = ['volt', 'freeze', 'wood', 'fire', 'moss', 'paper'] as const
export const THEMES = ['dark', 'light'] as const

export type PresetName = (typeof PRESETS)[number]
export type ThemeName = (typeof THEMES)[number]

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (message) => ['error', 'warning'].includes(message.type()) && errors.push(message.text()))
      page.on('pageerror', (error) => errors.push(String(error)))
      await use(errors)
      expect(errors).toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

export async function openSite(page: Page, theme: ThemeName = 'dark'): Promise<void> {
  await page.addInitScript((theme) => localStorage.setItem('theme', theme), theme)
  await page.goto(SITE)
  await page.addStyleTag({ content: '#demo { display: none }' })
  await page.evaluate(() => document.fonts.ready)
}

export async function useDots(page: Page): Promise<void> {
  await page.goto(FIXTURE)
  await page.evaluate(() => {
    const { hyperselect, dots } = window as unknown as { hyperselect: HyperSelect; dots: Preset }
    hyperselect.setPreset(dots)
  })
}

export async function choose(page: Page, preset: PresetName): Promise<void> {
  await page.evaluate((preset) => document.querySelector<HTMLElement>(`button[data-preset="${preset}"]`)!.click(), preset)
}

export async function select(page: Page, selector: string): Promise<void> {
  await page.evaluate((selector) => getSelection()!.selectAllChildren(document.querySelector(selector)!), selector)
}

export async function deselect(page: Page): Promise<void> {
  await page.evaluate(() => getSelection()!.removeAllRanges())
}

export async function reveal(page: Page, selector: string): Promise<void> {
  await page.evaluate((selector) => document.querySelector(selector)!.scrollIntoView({ block: 'center' }), selector)
}

export async function screenshot(page: Page): Promise<{ png: PNG; scale: number }> {
  const png = PNG.sync.read(await page.screenshot())
  return { png, scale: await page.evaluate(() => devicePixelRatio * visualViewport!.scale) }
}

export async function effectPixels(page: Page, selector: string): Promise<Uint8Array> {
  const rect = await page.evaluate((selector) => {
    document.querySelector('main')!.style.visibility = 'hidden'
    const r = document.querySelector(selector)!.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  }, selector)
  const { png, scale } = await screenshot(page)
  await page.evaluate(() => (document.querySelector('main')!.style.visibility = ''))
  const left = Math.round(rect.x * scale)
  const top = Math.round(rect.y * scale)
  const width = Math.round(rect.width * scale)
  const height = Math.round(rect.height * scale)
  const out = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = ((top + y) * png.width + left + x) * 4
      out[y * width + x] = (png.data[o]! + png.data[o + 1]! + png.data[o + 2]!) / 3
    }
  }
  return out
}

export function changedShare(a: Uint8Array, b: Uint8Array): number {
  let changed = 0
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i]! - b[i]!) > 4) changed++
  return changed / a.length
}
