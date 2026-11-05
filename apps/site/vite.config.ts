import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { readme } from './readme.ts'

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), readme],
  build: { chunkSizeWarningLimit: 1024 },
  resolve: {
    alias: {
      hyperselect: fileURLToPath(new URL('../../packages/hyperselect/src/index.ts', import.meta.url)),
      '@hyperselect/presets': fileURLToPath(new URL('../../packages/presets/src/index.ts', import.meta.url)),
    },
  },
})
