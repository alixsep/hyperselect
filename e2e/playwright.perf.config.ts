import { defineConfig, devices } from '@playwright/test'
import { chrome } from './playwright.config'

export default defineConfig({
  testDir: 'perf',
  workers: 1,
  timeout: 300_000,
  reporter: 'list',
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1200, height: 1000 }, launchOptions: chrome } }],
  webServer: { command: 'pnpm --filter site build && pnpm --filter site preview --port 4610 --strictPort', url: 'http://localhost:4610' },
})
