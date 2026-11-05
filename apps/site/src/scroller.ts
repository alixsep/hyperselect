const PAGE = 0.8

function arrow(list: HTMLElement, direction: 'back' | 'forward'): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `arrow ${direction}`
  button.tabIndex = -1
  button.setAttribute('aria-hidden', 'true')
  button.addEventListener('click', () => {
    const sign = direction === 'back' ? -1 : 1
    list.scrollBy({ left: sign * list.clientWidth * PAGE, behavior: 'smooth' })
  })
  return button
}

export function scroller(list: HTMLElement): void {
  const frame = list.parentElement!
  frame.append(arrow(list, 'back'), arrow(list, 'forward'))

  const end = (): number => list.scrollWidth - list.clientWidth - 1
  const update = (): void => {
    frame.toggleAttribute('data-back', list.scrollLeft > 1)
    frame.toggleAttribute('data-forward', list.scrollLeft < end())
  }

  const sizes = new ResizeObserver(update)
  sizes.observe(list)
  for (const child of list.children) sizes.observe(child)
  list.addEventListener('scroll', update, { passive: true })

  list.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (event.deltaY < 0 ? list.scrollLeft <= 0 : list.scrollLeft >= end()) return
      event.preventDefault()
      list.scrollLeft += event.deltaY
    },
    { passive: false },
  )
}
