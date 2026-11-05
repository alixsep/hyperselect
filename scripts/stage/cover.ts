import { createHyperSelect, type Theme } from 'hyperselect'
import { byName, play, selectTo } from './kit.ts'

const params = new URLSearchParams(location.search)
const theme = (params.get('theme') ?? 'dark') as Theme
const root = document.documentElement
root.dataset.theme = theme
root.dataset.layout = params.get('layout') ?? 'social'

const wordmark = document.querySelector<HTMLElement>('.wordmark')!
const emphasis = wordmark.querySelector('em')!
const word = emphasis.firstChild!

await document.fonts.load('italic 16px "Fraunces Variable"')

function monogram(): number {
  wordmark.firstChild!.textContent = 'H'
  word.textContent = 'S'
  const { width, height } = emphasis.getBoundingClientRect()
  const side = (height * 0.62 - width) / 2
  emphasis.style.marginLeft = `${side}px`
  wordmark.style.translate = `${-side / 2}px`
  return side
}

const side = root.dataset.layout === 'mark' ? monogram() : 0
createHyperSelect({ preset: byName.freeze!, theme, padding: { left: side, right: side } })

await play(() => selectTo(word, word.textContent!.length))
