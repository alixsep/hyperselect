import { fileURLToPath } from 'node:url'
import { render, type Shot } from './capture.ts'

const demo = (name: string, seconds: number, warmup = 0): Shot => ({
  file: `media/${name}.gif`,
  parts: [{ page: `demo.html?demo=${name}`, seconds, warmup }],
  fps: 15,
  width: 480,
  height: 240,
})

const still = (file: string, page: string, width: number, height: number, viewport = 400): Shot => ({
  file,
  parts: [{ page, seconds: 1, zoom: width / viewport, warmup: 2.5 }],
  fps: 1,
  width,
  height,
})

const shots: Shot[] = [
  demo('selection', 5),
  demo('presets', 4.8, 4.8),
  demo('themes', 4, 4),
  demo('highlights', 3, 3),
  still('media/banner-dark.png', 'cover.html?layout=banner&theme=dark', 1600, 440),
  still('media/banner-light.png', 'cover.html?layout=banner&theme=light', 1600, 440),
  still('apps/site/public/social.png', 'cover.html?layout=social&theme=dark', 1200, 630),
  {
    ...still('media/logo.png', 'cover.html?layout=mark', 512, 512, 200),
    copies: [
      { file: 'apps/site/public/apple-touch-icon.png', size: 180 },
      { file: 'apps/site/public/favicon.png', size: 64 },
    ],
  },
]

const only = process.argv.slice(2)
const chosen = shots.filter((shot) => !only.length || only.some((name) => shot.file.endsWith(name)))
await render(fileURLToPath(new URL('stage', import.meta.url)), chosen)
