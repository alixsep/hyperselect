import { Governor } from './governor'
import { Layer } from './layer'
import { LINE_FLOATS, Lines, MAX_LINES } from './lines'
import { Pool, SPRITE_FLOATS } from './pool'
import { arrange, drawnRegion, type Origin, type Region, toLocal } from './region'
import { type Frame, Renderer } from './renderer'
import { type Look, type Padding, readSelection, type Selected, toPadding } from './selection'
import { Stage } from './stage'
import { Tracker } from './tracker'
import type { Behavior, Preset, Theme } from './types'

const CAPACITY = 4096
const MAX_DPR = 1.5
const PIXEL_BUDGET = 4e6
const MARGIN = 160
const RESYNC_MS = 100
const FADE_RATE = 14
const SELECTED = 'data-hyperselect-selected'
const NOTHING: Selected = { rects: [], elements: new Map(), hosts: new Map() }
const WATCHED: MutationObserverInit = { subtree: true, childList: true, characterData: true, attributes: true }

const visibleSize = (): { width: number; height: number; scale: number } =>
  visualViewport ?? { width: document.documentElement.clientWidth, height: innerHeight, scale: 1 }

export interface Options {
  preset: Preset
  theme?: Theme
  root?: HTMLElement
  zIndex?: number
  padding?: number | Partial<Padding>
  adaptive?: boolean
}

export interface HyperSelect {
  setPreset(preset: Preset): void
  setTheme(theme: Theme): void
  destroy(): void
}

export class Engine implements HyperSelect {
  private readonly root: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly zIndex: number
  private readonly padding: Padding
  private readonly layers = new Map<HTMLElement, Layer>()
  private readonly owners = new Map<number, HTMLElement>()
  private selected = new Map<HTMLElement, Look>()
  private readonly themes = new Map<HTMLElement, Theme | null>()
  private readonly renderer: Renderer
  private readonly stage = new Stage()
  private readonly sheet = new CSSStyleSheet()
  private readonly lines = new Lines()
  private readonly tracker = new Tracker()
  private readonly pool = new Pool(CAPACITY)
  private readonly governor: Governor | null
  private readonly sim: { pool: Pool; lines: Lines; dt: number; time: number }
  private readonly packed = { lines: new Float32Array(MAX_LINES * LINE_FLOATS), sprites: new Float32Array(CAPACITY * SPRITE_FLOATS) }
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  private readonly forcedColors = matchMedia('(forced-colors: active)')
  private readonly lightScheme = matchMedia('(prefers-color-scheme: light)')
  private readonly listeners = new AbortController()
  private readonly observer = new ResizeObserver(() => this.relayout())
  private readonly mutations = new MutationObserver((records) => this.onMutation(records))
  private preset: Preset
  private next: Preset | null = null
  private behavior: Behavior | undefined
  private pinnedTheme: Theme | undefined
  private fade = 1
  private width = 0
  private height = 0
  private sharpness = 0
  private skipped = false
  private documentWidth = 0
  private documentHeight = 0
  private handle = 0
  private last = 0
  private lastSync = 0
  private stale = false
  private watching = false

  static create(options: Options): Engine | null {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    const renderer = Renderer.create(canvas, CAPACITY)
    return renderer && new Engine(options, canvas, renderer)
  }

  private constructor(options: Options, canvas: HTMLCanvasElement, renderer: Renderer) {
    this.root = options.root ?? document.documentElement
    this.canvas = canvas
    this.zIndex = options.zIndex ?? -1
    this.padding = toPadding(options.padding)
    this.governor = options.adaptive ? new Governor() : null
    this.renderer = renderer
    this.preset = options.preset
    this.pinnedTheme = options.theme
    this.sim = { pool: this.pool, lines: this.lines, dt: 0, time: 0 }
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet]
    this.listen()
    this.observer.observe(document.documentElement)
    this.apply(this.preset)
    this.relayout()
    document.fonts.ready.then(() => this.relayout())
  }

  setPreset(preset: Preset): void {
    if (preset === this.preset) this.next = null
    else if (!this.lines.all.length && !this.pool.count) this.apply(preset)
    else {
      this.renderer.prepare(preset)
      this.next = preset
    }
    this.wake()
  }

  setTheme(theme: Theme): void {
    this.pinnedTheme = theme
    this.retheme()
  }

  destroy(): void {
    this.listeners.abort()
    this.observer.disconnect()
    this.mutations.disconnect()
    cancelAnimationFrame(this.handle)
    this.renderer.dispose()
    for (const layer of this.layers.values()) layer.remove()
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.sheet)
    this.select(new Map())
    this.root.removeAttribute('data-hyperselect')
  }

  private listen(): void {
    const options = { signal: this.listeners.signal, passive: true }
    document.addEventListener('selectionchange', () => this.refresh(), options)
    addEventListener('resize', () => this.relayout(), options)
    visualViewport?.addEventListener('resize', this.onZoom, options)
    visualViewport?.addEventListener('scroll', this.onZoom, options)
    document.addEventListener('scroll', this.onScroll, { ...options, capture: true })
    document.addEventListener('transitionend', (event) => /^(background-)?color$/.test(event.propertyName) && this.refresh(), options)
    this.canvas.addEventListener('webglcontextlost', this.onContextLost, { signal: this.listeners.signal })
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored, options)
    this.forcedColors.addEventListener('change', () => this.refresh(), options)
    this.lightScheme.addEventListener('change', () => this.retheme(), options)
  }

  private get theme(): Theme {
    return this.pinnedTheme ?? (this.lightScheme.matches ? 'light' : 'dark')
  }

  private retheme(): void {
    this.restyle()
    this.refresh()
  }

  private readonly onZoom = (): void => {
    this.resize()
    if (this.lines.all.length || this.pool.count) this.wake()
  }

  private onMutation(records: MutationRecord[]): void {
    if (records.every(this.ours)) return
    this.stale = true
    this.wake()
  }

  private readonly ours = (record: MutationRecord): boolean =>
    record.type === 'childList'
      ? [...record.addedNodes, ...record.removedNodes].every(this.owns)
      : record.attributeName === SELECTED || this.owns(record.target)

  private readonly owns = (node: Node): boolean => {
    if (node === this.canvas) return true
    for (const layer of this.layers.values()) if (layer.owns(node)) return true
    return false
  }

  private watch(selected: boolean): void {
    if (selected === this.watching) return
    this.watching = selected
    if (selected) this.mutations.observe(document.documentElement, WATCHED)
    else this.mutations.disconnect()
  }

  private readonly onScroll = (event: Event): void => {
    if (document.getSelection()?.isCollapsed !== false) {
      if (this.lines.all.length || this.pool.count) this.wake()
      return
    }
    if (event.target !== document) this.sync()
    else this.stale = true
    this.wake()
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault()
    cancelAnimationFrame(this.handle)
    this.handle = 0
  }

  private readonly onContextRestored = (): void => {
    this.renderer.restore()
    this.relayout()
  }

  private refresh(): void {
    if (this.listeners.signal.aborted) return
    this.sync()
    this.wake()
  }

  private relayout(): void {
    if (this.listeners.signal.aborted) return
    this.measure()
    this.refresh()
  }

  private measure(): void {
    for (const layer of this.layers.values()) layer.hidden = true
    this.measureDocument()
    for (const layer of this.layers.values()) layer.hidden = false
  }

  private measureDocument(): void {
    this.documentWidth = document.documentElement.scrollWidth
    this.documentHeight = document.documentElement.scrollHeight
    this.resize()
  }

  private sync(): void {
    this.stale = false
    this.lastSync = performance.now()
    const { rects, elements, hosts } = this.forcedColors.matches ? NOTHING : readSelection(this.root, this.padding, this.originOf)
    this.lines.sync(rects)
    this.measureDocument()
    this.watch(rects.length > 0)
    for (const [host, theme] of hosts) this.themes.set(host, theme)
    this.select(elements)
    this.tracker.watch(elements.keys())
  }

  private resize(): void {
    const visible = visibleSize()
    this.width = Math.min(Math.ceil(visible.width) + 1, this.documentWidth)
    this.height = Math.ceil(Math.min(visible.height + 2 * MARGIN, this.documentHeight))
    this.sharpness = Math.min((devicePixelRatio || 1) * visible.scale, MAX_DPR)
  }

  private readonly originOf = (host: HTMLElement): Origin => {
    let layer = this.layers.get(host)
    if (!layer) this.layers.set(host, (layer = new Layer(host, this.zIndex)))
    layer.attach()
    return layer.origin()
  }

  private view(): Region {
    const left = scrollX + (visualViewport?.offsetLeft ?? 0)
    const top = scrollY + (visualViewport?.offsetTop ?? 0)
    return {
      x: Math.max(0, Math.min(left, this.documentWidth - this.width)) - scrollX,
      y: Math.max(0, Math.min(top - MARGIN, this.documentHeight - this.height)) - scrollY,
      width: this.width,
      height: this.height,
    }
  }

  private paced(area: number): number | null {
    const dpr = area * this.sharpness ** 2 > PIXEL_BUDGET ? Math.min(this.sharpness, 1) : this.sharpness
    this.skipped = area * dpr ** 2 > PIXEL_BUDGET && !this.skipped
    return this.skipped ? null : dpr
  }

  private apply(preset: Preset): void {
    this.preset = preset
    this.next = null
    this.behavior = preset.behavior?.()
    this.pool.clear()
    this.lines.restart()
    this.renderer.prepare(preset)
    this.restyle()
  }

  private restyle(): void {
    const { selection } = this.preset
    const marked = `[data-hyperselect] [${SELECTED}`
    this.root.setAttribute('data-hyperselect', this.preset.name)
    this.sheet.replaceSync(
      `@media not (forced-colors:active){[data-hyperselect] :not(input, textarea)::selection{background:transparent}${marked}]::selection{${selection[this.theme]}}` +
        `${marked}=light]::selection{${selection.light}}${marked}=dark]::selection{${selection.dark}}` +
        `${marked}=native]::selection{background:Highlight;color:HighlightText}}`,
    )
  }

  private select(elements: Map<HTMLElement, Look>): void {
    for (const element of this.selected.keys()) if (!elements.has(element)) element.removeAttribute(SELECTED)
    for (const [element, look] of elements) if (this.selected.get(element) !== look) element.setAttribute(SELECTED, look ?? '')
    this.selected = elements
  }

  private wake(): void {
    if (this.handle || this.renderer.lost || this.listeners.signal.aborted) return
    this.last = performance.now()
    this.handle = requestAnimationFrame(this.loop)
  }

  private readonly loop = (now: number): void => {
    this.handle = 0
    this.governor?.sample(now - this.last)
    const dt = Math.min(Math.max(now - this.last, 0) / 1000, 1 / 20)
    this.last = now
    if (this.renderer.lost) return
    this.tick(dt)
    this.render()
    if (this.busy && !this.handle) this.handle = requestAnimationFrame(this.loop)
  }

  private get busy(): boolean {
    return this.stale || this.lines.all.length > 0 || this.pool.count > 0 || this.next !== null || this.fade < 1
  }

  private tick(dt: number): void {
    const still = this.reducedMotion.matches
    this.sim.dt = dt
    if (!still) this.sim.time += dt
    this.stepFade(dt)
    if ((this.stale && performance.now() - this.lastSync > RESYNC_MS) || this.tracker.moved()) this.sync()
    this.lines.step(dt)
    const behavior = this.behavior
    if (!behavior) return
    if (!still && !this.next && this.fade > 0.5) {
      for (const line of this.lines.all) if (!line.dead && !this.pool.full) behavior.emit(line, this.sim)
    }
    this.pool.forEach(this.updateParticle)
  }

  private readonly updateParticle = (i: number): void => {
    this.pool.age[i] += this.sim.dt
    if (!this.behavior!.update(i, this.sim)) this.pool.kill(i)
  }

  private stepFade(dt: number): void {
    const target = this.next ? 0 : 1
    this.fade += (target - this.fade) * (1 - Math.exp(-dt * FADE_RATE))
    if (Math.abs(target - this.fade) < 0.002) this.fade = target
    if (this.next && this.fade < 0.03 && !this.renderer.compiling(this.next)) this.apply(this.next)
  }

  private render(): void {
    if (!this.lines.all.length && !this.pool.count) {
      this.owners.clear()
      this.themes.clear()
    }
    for (const line of this.lines.all) this.owners.set(line.id, line.backdrop)
    const hosts = new Set(this.owners.values())
    for (const [host, layer] of this.layers) {
      if (hosts.has(host)) continue
      layer.remove()
      this.layers.delete(host)
    }
    const view = this.view()
    const placed = [...hosts].map((host) => {
      const origin = this.originOf(host)
      return { layer: this.layers.get(host)!, origin, view: toLocal(view, origin) }
    })
    const area = placed.reduce((sum, { layer, origin, view }) => sum + this.lines.area(this.preset.pad, view, layer.host) * origin.scale ** 2, 0)
    const paced = this.paced(area)
    if (paced === null) return
    const dpr = paced * (this.governor?.scale ?? 1)
    const jobs: { layer: Layer; region: Region; frame: Frame; width: number; height: number }[] = []
    let lines = 0
    let sprites = 0
    for (const { layer, origin, view } of placed) {
      const frame = this.pack(layer.host, dpr * origin.scale, lines, sprites)
      lines += frame.lineCount
      sprites += frame.spriteCount
      const found = drawnRegion(frame, this.preset.pad, view)
      if (!found) {
        if (layer.drawn) layer.clear()
        continue
      }
      const region = layer.fit(found)
      frame.x = region.x
      frame.y = region.y
      jobs.push({ layer, region, frame, width: Math.ceil(region.width * frame.dpr), height: Math.ceil(region.height * frame.dpr) })
    }
    jobs.sort((a, b) => b.width * b.height - a.width * a.height)
    const { slots, width, height } = arrange(jobs)
    const [primary, ...copies] = jobs.map((job, i) => ({ ...job, slot: slots[i]! }))
    if (!primary) return
    this.renderer.begin(width, height)
    if (copies.length) {
      for (const { frame, slot } of copies) this.renderer.draw(this.preset, frame, slot)
      const staged = this.stage.capture(this.canvas)
      for (const { layer, region, slot } of copies) {
        layer.cover(region)
        layer.show(staged, slot)
      }
      this.renderer.begin(width, height)
    }
    this.renderer.draw(this.preset, primary.frame, primary.slot)
    primary.layer.cover(primary.region)
    primary.layer.present(this.canvas, primary.slot)
  }

  private pack(host: HTMLElement, dpr: number, lines: number, sprites: number): Frame {
    const frame: Frame = {
      time: this.sim.time,
      fade: this.fade,
      light: (this.themes.get(host) ?? this.theme) === 'light' ? 1 : 0,
      x: 0,
      y: 0,
      dpr,
      lines: this.packed.lines.subarray(lines * LINE_FLOATS),
      lineCount: 0,
      sprites: this.packed.sprites.subarray(sprites * SPRITE_FLOATS),
      spriteCount: 0,
    }
    frame.lineCount = this.lines.pack(frame.lines, host)
    frame.spriteCount = this.pool.pack(frame.sprites, (line) => this.owners.get(line) === host)
    return frame
  }
}
