import { type Category, categories, volt } from '@hyperselect/presets'
import { createHyperSelect, type Highlight, highlight, type Preset, type Theme } from 'hyperselect'
import { playDemo } from './demo'
import { scroller } from './scroller'

interface Entry {
  readonly preset: Preset
  readonly category: Category
  readonly button: HTMLButtonElement
  readonly label: HTMLElement
}

const root = document.documentElement
const categoryList = document.querySelector<HTMLElement>('#categories')!
const presetList = document.querySelector<HTMLElement>('#presets')!
const pill = document.querySelector<HTMLElement>('#pill')!
const themeButton = document.querySelector<HTMLButtonElement>('#theme')!

const rgb = (tint: Preset['tint']): string => `rgb(${tint.map((c) => Math.round(c * 255)).join(' ')})`

function span(className: string, text = ''): HTMLSpanElement {
  const element = document.createElement('span')
  element.className = className
  element.textContent = text
  return element
}

function button(data: Record<string, string>, ...children: (Node | string)[]): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  Object.assign(element.dataset, data)
  element.append(...children)
  return element
}

const groups = new Map<Category, HTMLElement>()
const tabs = new Map<Category, HTMLButtonElement>()
const entries: Entry[] = []

for (const [category, presets] of Object.entries(categories) as [Category, Readonly<Record<string, Preset>>][]) {
  const tab = button({ category }, category)
  tab.addEventListener('click', () => {
    if (entries[current]!.category !== category) choose(entries.find((e) => e.category === category)!.preset.name)
  })
  tabs.set(category, tab)
  categoryList.append(tab)

  const group = document.createElement('div')
  group.setAttribute('role', 'group')
  group.setAttribute('aria-label', category)
  for (const preset of Object.values(presets)) {
    const label = span('label', preset.name)
    const entry: Entry = { preset, category, label, button: button({ preset: preset.name }, label) }
    entry.button.addEventListener('click', () => choose(preset.name))
    entries.push(entry)
    group.append(entry.button)
  }
  groups.set(category, group)
  presetList.append(group)
}

scroller(categoryList)
scroller(presetList)

const params = new URLSearchParams(location.search)
let current = 0
let shown: Category | undefined
let highlights: Highlight[] = []
const theme = (): Theme => (root.dataset.theme === 'light' ? 'light' : 'dark')
const selection = createHyperSelect({ preset: volt, theme: theme(), adaptive: params.has('adaptive') })

function movePill(animate: boolean): void {
  const { button } = entries[current]!
  pill.style.transition = animate ? '' : 'none'
  pill.style.translate = `${button.offsetLeft}px ${button.offsetTop}px`
  pill.style.width = `${button.offsetWidth}px`
  pill.style.height = `${button.offsetHeight}px`
}

function showCategory(category: Category): void {
  if (category === shown) return
  shown = category
  for (const old of highlights) old.destroy()
  highlights = entries.filter((e) => e.category === category).map((e) => highlight(e.label, { preset: e.preset, theme: theme() }))
  pausePreviews()
}

function pausePreviews(): void {
  const paused = getSelection()?.isCollapsed === false
  for (const preview of highlights) preview.setPaused(paused)
}

function choose(name: string | undefined, animate = true): void {
  const index = entries.findIndex((e) => e.preset.name === name)
  if (index < 0) return
  current = index
  const { preset, category, button } = entries[index]!
  root.dataset.preset = preset.name
  root.style.setProperty('--tint', rgb(preset.tint))
  for (const [key, group] of groups) group.hidden = key !== category
  for (const [key, tab] of tabs) tab.setAttribute('aria-pressed', String(key === category))
  for (const entry of entries) entry.button.setAttribute('aria-pressed', String(entry === entries[index]))
  movePill(animate)
  showCategory(category)
  const behavior = animate ? 'smooth' : 'instant'
  tabs.get(category)!.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior })
  button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior })
  selection.setPreset(preset)
}

function showTheme(): void {
  themeButton.setAttribute('aria-checked', String(theme() === 'light'))
}

const stillMotion = matchMedia('(prefers-reduced-motion: reduce)')
let switching = 0

function applyTheme(next: Theme): void {
  root.dataset.theme = next
  showTheme()
  selection.setTheme(next)
  for (const preview of highlights) preview.setTheme(next)
  try {
    localStorage.setItem('theme', next)
  } catch {}
}

async function toggleTheme(): Promise<void> {
  const next: Theme = theme() === 'light' ? 'dark' : 'light'
  switching++
  root.classList.add('theming')
  if (document.startViewTransition && !stillMotion.matches) await document.startViewTransition(() => applyTheme(next)).finished
  else {
    applyTheme(next)
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  }
  if (--switching === 0) root.classList.remove('theming')
}

themeButton.addEventListener('click', toggleTheme)
showTheme()

addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement) return
  if (event.key.toLowerCase() === 't') toggleTheme()
  else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const step = event.key === 'ArrowRight' ? 1 : -1
    choose(entries[(current + step + entries.length) % entries.length]!.preset.name)
  }
})

document.addEventListener('selectionchange', pausePreviews)
addEventListener('resize', () => movePill(false))
document.fonts.ready.then(() => movePill(false))

for (const block of document.querySelectorAll('.readme pre')) {
  const copy = block.appendChild(button({}, 'Copy'))
  copy.className = 'copy'
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(block.querySelector('code')!.textContent!)
    copy.textContent = 'Copied'
    setTimeout(() => (copy.textContent = 'Copy'), 1600)
  })
}

choose(volt.name, false)
if (params.has('stats')) import('./stats').then(({ showStats }) => showStats())
document.fonts.ready.then(() => playDemo(document.querySelector('#demo')!, document.querySelector('#hand')!))
