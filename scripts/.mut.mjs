import { chromium, firefox } from '@playwright/test'
for (const [name, type, opts] of [['chrome', chromium, { executablePath: '/usr/bin/google-chrome' }], ['firefox', firefox, {}]]) {
  const b = await type.launch(opts)
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6, isMobile: name === 'chrome', hasTouch: true })
  await p.goto('http://localhost:5301/')
  await p.waitForTimeout(2500)
  const r = await p.evaluate(async () => {
    const sub = document.querySelector('header p:nth-of-type(2)') ?? document.querySelector('main p')
    sub.scrollIntoView({ block: 'center' })
    const range = document.createRange(); range.selectNodeContents(sub.firstChild ?? sub); range.setEnd(range.startContainer, Math.min(20, range.startContainer.length ?? 1))
    getSelection().removeAllRanges(); getSelection().addRange(range)
    await new Promise((r) => setTimeout(r, 1500))
    const log = {}
    const mo = new MutationObserver((rs) => { for (const r of rs) { const k = `${r.type}:${r.attributeName ?? ''}:${r.target.nodeName}${r.target.className ? '.' + r.target.className : ''}`; log[k] = (log[k] ?? 0) + 1 } })
    mo.observe(document.documentElement, { subtree: true, attributes: true, childList: true, attributeOldValue: false })
    await new Promise((r) => setTimeout(r, 3000))
    mo.disconnect()
    return log
  })
  console.log(name, JSON.stringify(r))
  await b.close()
}
