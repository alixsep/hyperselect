import { defineConfig, devices } from '@playwright/test'

const gpuless = !!process.env.CI

export const chrome = {
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
  args: gpuless ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'],
}

const portable = ['alignment.spec.ts', 'custom.spec.ts', 'render.spec.ts']

export default defineConfig({
  testDir: 'tests',
  workers: 1,
  timeout: 120_000,
  reporter: 'list',
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1200, height: 1000 }, launchOptions: chrome },
    },
    { name: 'firefox', use: devices['Desktop Firefox'], testMatch: portable },
    { name: 'android', use: { ...devices['Pixel 7'], launchOptions: chrome }, testMatch: portable },
    // TODO: enable once WebKit runs locally
    // { name: 'safari', use: devices['Desktop Safari'], testMatch: portable },
    // { name: 'iphone', use: devices['iPhone 15'], testMatch: portable },
  ],
  webServer: [
    { command: 'pnpm --filter site build && pnpm --filter site preview --port 4610 --strictPort', url: 'http://localhost:4610' },
    { command: 'pnpm --filter hyperselect build && vite fixtures --port 4611 --strictPort', url: 'http://localhost:4611' },
  ],
})
