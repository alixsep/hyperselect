import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import { highlight } from 'sugar-high'
import type { Plugin } from 'vite'

const README = fileURLToPath(new URL('../../packages/hyperselect/README.md', import.meta.url))
const PICK = /<!-- readme: (.+?) -->/g
const REST = '<!-- readme: rest -->'
const SKIPPED = ['License']

const marked = new Marked({
  renderer: {
    code: ({ text, lang }) => `<pre data-lang="${lang ?? ''}"><code>${tokens(text)}</code></pre>\n`,
  },
})

const markup = (markdown: string): string => marked.parse(markdown, { async: false })

const tokens = (code: string): string =>
  highlight(code)
    .replace(/ style="[^"]*"/g, '')
    .replace(/<span class="sh__token--space">([^<]*)<\/span>/g, '$1')

function sections(): Map<string, string> {
  const markdown = readFileSync(README, 'utf8').replace(/^!\[.*\]\(.*\)\n/gm, '')
  const parts = markdown.split(/^(?=## )/m).slice(1)
  return new Map(parts.map((part) => [part.slice(3, part.indexOf('\n')), part]))
}

function collapsible(part: string): string {
  const [title, ...body] = part.split('\n')
  return `<details><summary>${markup(title!)}</summary>${markup(body.join('\n'))}</details>\n`
}

function render(page: string): string {
  const parts = sections()
  const placed = new Set(SKIPPED)
  const take = (title: string): string => {
    const part = parts.get(title)
    if (!part) throw new Error(`apps/site/index.html asks for README section "${title}", which does not exist`)
    placed.add(title)
    return part
  }
  const picked = page.replace(PICK, (match, titles: string) => (match === REST ? match : markup(titles.split(', ').map(take).join(''))))
  const rest = [...parts].filter(([title]) => !placed.has(title)).map(([, part]) => collapsible(part))
  return picked.replace(REST, () => rest.join(''))
}

export const readme: Plugin = {
  name: 'readme',
  transformIndexHtml: render,
  configureServer(server) {
    server.watcher.add(README)
    server.watcher.on('change', (file) => file === README && server.ws.send({ type: 'full-reload' }))
  },
}
