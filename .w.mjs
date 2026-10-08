import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []; p.on('pageerror', (e) => errors.push(String(e)))
const state = async () => { const c = (await p.locator('.portfolio-counter').innerText()).trim().replace(' / 03', ''); const y = await p.evaluate(() => Math.round(scrollY)); return y ? `${c}(footer)` : c }
const gesture = async (dir = 1, n = 60, peak = 50, holes = false) => {
  for (let i = 0; i < n; i++) {
    const d = i < 6 ? peak * (i + 1) / 6 : Math.max(1, peak * Math.exp(-(i - 6) / 12))
    await p.mouse.wheel(0, dir * d); await p.waitForTimeout(holes && i % 15 === 14 ? 300 : 16)
  }
}
const notch = async (dir = 1) => { await p.mouse.wheel(0, dir * 100) }
const run = async (label, steps) => {
  await p.goto('http://localhost:3000/fr/projects', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); await p.mouse.move(720, 500)
  const out = []
  for (const [fn, pause] of steps) { await fn(); await p.waitForTimeout(pause); out.push(await state()) }
  console.log(label.padEnd(46), out.join(' → '))
}
const down = () => gesture(1), up = () => gesture(-1), shortDown = () => gesture(1, 12)
for (let k = 0; k < 2; k++) {
await run('trackpad, gestes longs avec inertie', [[down, 300], [down, 300], [down, 300], [down, 300]])
await run('trackpad, gestes courts espacés de 150 ms', [[shortDown, 150], [shortDown, 600], [shortDown, 150], [shortDown, 600]])
await run('aller-retour (bas x3 puis haut x4)', [[down, 300], [down, 300], [down, 300], [up, 300], [up, 300], [up, 300], [up, 300]])
await run('inertie avec trous de 300 ms', [[() => gesture(1, 60, 50, true), 300], [() => gesture(1, 60, 50, true), 300], [() => gesture(1, 60, 50, true), 300]])
await run('molette souris, un cran par seconde', [[notch, 1000], [notch, 1000], [notch, 1000], [() => notch(-1), 1000], [() => notch(-1), 1000]])
await run('molette souris, crans espacés de 400 ms', [[notch, 400], [notch, 400], [notch, 400], [notch, 400]])
await run('un seul très long geste (inertie 3 s)', [[() => gesture(1, 180, 80), 300]])
}
console.log('errors', errors)
await b.close()
