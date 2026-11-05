import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { type Browser, chromium } from '@playwright/test'
import { createServer, type Plugin } from 'vite'

export interface Part {
  readonly page: string
  readonly seconds: number
  readonly zoom?: number
  readonly warmup?: number
}

export interface Copy {
  readonly file: string
  readonly size: number
}

export interface Shot {
  readonly file: string
  readonly copies?: readonly Copy[]
  readonly parts: readonly Part[]
  readonly fps: number
  readonly width: number
  readonly height: number
}

const SUPERSAMPLE = 2
const ROOT = fileURLToPath(new URL('../', import.meta.url))
const source = (path: string): string => fileURLToPath(new URL(`../packages/${path}/src/index.ts`, import.meta.url))

function encoder({ file, width, height }: Shot): string[] {
  const scale = `scale=${width}:${height}:flags=lanczos`
  if (file.endsWith('.png')) return ['-vf', scale, '-frames:v', '1', '-update', '1']
  if (file.endsWith('.gif')) {
    return ['-vf', `${scale},split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0']
  }
  return ['-vf', `${scale},unsharp=5:5:0.6`, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']
}

function seededRandom(): void {
  let seed = 1
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32
  }
}

async function capture(browser: Browser, base: string, shot: Shot, { page: path, seconds, zoom = 1, warmup = 0 }: Part, sink: Writable): Promise<void> {
  const page = await browser.newPage({
    viewport: { width: shot.width / zoom, height: shot.height / zoom },
    deviceScaleFactor: SUPERSAMPLE * zoom,
  })
  await page.addInitScript(seededRandom)
  await page.clock.install({ time: 0 })
  await page.clock.pauseAt(1000)
  await page.goto(base + path)
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await page.clock.runFor(warmup * 1000)
  const frames = Math.round(seconds * shot.fps)
  for (let i = 0; i < frames; i++) {
    await page.clock.runFor(1000 / shot.fps)
    if (!sink.write(await page.screenshot({ omitBackground: true }))) await once(sink, 'drain')
  }
  await page.close()
}

async function record(browser: Browser, base: string, shot: Shot): Promise<void> {
  await mkdir(dirname(ROOT + shot.file), { recursive: true })
  const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(shot.fps), '-i', '-', ...encoder(shot), ROOT + shot.file], {
    stdio: ['pipe', 'inherit', 'inherit'],
  })
  for (const part of shot.parts) await capture(browser, base, shot, part, ffmpeg.stdin)
  ffmpeg.stdin.end()
  const [code] = await once(ffmpeg, 'close')
  if (code !== 0) throw new Error(`ffmpeg failed on ${shot.file}`)
  console.log(shot.file)
  for (const copy of shot.copies ?? []) await resize(shot.file, copy)
}

async function resize(source: string, { file, size }: Copy): Promise<void> {
  const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', ROOT + source, '-vf', `scale=${size}:${size}:flags=lanczos`, ROOT + file], { stdio: 'inherit' })
  const [code] = await once(ffmpeg, 'close')
  if (code !== 0) throw new Error(`ffmpeg failed on ${file}`)
  console.log(file)
}

const uncapped = (code: string): string =>
  code.replace(/const MAX_DPR = [\d.]+/, 'const MAX_DPR = 64').replace(/const PIXEL_BUDGET = [\de.]+/, 'const PIXEL_BUDGET = 1e9')

const fullResolution: Plugin = {
  name: 'full-resolution',
  transform: (code, id) => (id.includes('/packages/hyperselect/') ? uncapped(code) : undefined),
}

export async function render(stage: string, shots: readonly Shot[]): Promise<void> {
  const server = await createServer({
    root: stage,
    configFile: false,
    logLevel: 'error',
    plugins: [fullResolution],
    resolve: { alias: { hyperselect: source('hyperselect'), '@hyperselect/presets': source('presets') } },
    server: { port: 0 },
  })
  await server.listen()
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
    args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'],
  })
  for (const shot of shots) await record(browser, server.resolvedUrls!.local[0]!, shot)
  await browser.close()
  await server.close()
}
