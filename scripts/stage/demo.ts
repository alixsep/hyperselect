import { createHyperSelect, highlight, type Theme } from 'hyperselect'
import { byName, caretAt, easeInOut, easeOut, element, lerp, moveTo, play, progress, selectTo } from './kit.ts'

type Demo = () => (t: number) => void

const PARAGRAPH = 'Select any text on the page. The effect grows behind each line, while copying, dragging and screen readers keep working as usual.'
const SWAPS = ['fire', 'volt', 'freeze', 'caustics']
const SWAP_EVERY = 1.2
const THEME_EVERY = 2
const CHIPS = ['neon', 'honey', 'caustics', 'paper', 'pixel', 'wood']

const stage = document.querySelector<HTMLElement>('#stage')!
const pointer = document.querySelector<HTMLElement>('#pointer')!

const line = (className: string, text: string): Text => stage.appendChild(element('p', className, text)).firstChild as Text
const caption = (text: string): HTMLElement => stage.appendChild(element('p', 'code', text))

const selection: Demo = () => {
  createHyperSelect({ preset: byName.neon!, theme: 'dark' })
  const node = line('paragraph', PARAGRAPH)
  const length = PARAGRAPH.length
  const rest = { x: innerWidth * 0.86, y: innerHeight * 0.92 }
  pointer.hidden = false
  return (time) => {
    const t = time % 5
    const offset = Math.round(easeInOut(progress(t, 0.6, 2.8)) * length)
    selectTo(node, t < 4.3 ? offset : 0)
    if (t < 0.6) moveTo(pointer, lerp(rest, caretAt(node, 0), easeOut(progress(t, 0, 0.5))))
    else if (t < 4.3) moveTo(pointer, caretAt(node, offset))
    else moveTo(pointer, lerp(caretAt(node, length), rest, easeInOut(progress(t, 4.3, 5))))
  }
}

const presets: Demo = () => {
  const engine = createHyperSelect({ preset: byName[SWAPS[0]!]!, theme: 'dark' })
  const node = line('sentence', 'Swap presets at any time.')
  const code = caption('')
  let shown = -1
  return (t) => {
    selectTo(node, node.length)
    const index = Math.floor(t / SWAP_EVERY) % SWAPS.length
    if (index === shown) return
    shown = index
    engine.setPreset(byName[SWAPS[index]!]!)
    code.textContent = `selection.setPreset(${SWAPS[index]})`
  }
}

const themes: Demo = () => {
  const engine = createHyperSelect({ preset: byName.freeze!, theme: 'dark' })
  const node = line('sentence', 'Fits light and dark pages.')
  const code = caption('')
  let shown: Theme | undefined
  return (t) => {
    selectTo(node, node.length)
    const theme = Math.floor(t / THEME_EVERY) % 2 ? 'light' : 'dark'
    if (theme === shown) return
    shown = theme
    document.documentElement.dataset.theme = theme
    engine.setTheme(theme)
    code.textContent = `selection.setTheme('${theme}')`
  }
}

const highlights: Demo = () => {
  const chips = stage.appendChild(element('div', 'chips'))
  for (const name of CHIPS) highlight(chips.appendChild(element('span', '', name)), { preset: byName[name]!, theme: 'dark' })
  caption('highlight(element, { preset })')
  return () => {}
}

const demos: Record<string, Demo> = { selection, presets, themes, highlights }
await play(demos[new URLSearchParams(location.search).get('demo')!]!())
