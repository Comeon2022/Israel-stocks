const route = process.argv[2] ?? 'company/sano'
const version = await (await fetch('http://127.0.0.1:9222/json/version')).json()
const page = (await (await fetch('http://127.0.0.1:9222/json')).json()).find(x => x.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl); let id = 0; const pending = new Map()
ws.onmessage = event => { const m = JSON.parse(event.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
const send = (method, params = {}) => new Promise(resolve => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable'); await send('Runtime.enable'); await send('Page.navigate', { url: `https://israel-stocks.pages.dev/${route}` }); await new Promise(r => setTimeout(r, 5000))
const result = await send('Runtime.evaluate', { expression: `JSON.stringify((() => { const text = document.body.innerText; const lines = text.split('\\n').map(s => s.trim()).filter(Boolean); const key = /MOCK|GLOBES|TTM|IFRS|valuation|market|price|2023|2024|2025|2026|annual|quarter|unavailable/i; return { textLength: text.length, lines: lines.filter(x => key.test(x)).slice(0, 100), yearCounts: Object.fromEntries([2023, 2024, 2025, 2026].map(y => [y, (text.match(new RegExp(String(y), 'g')) || []).length])), links: [...document.querySelectorAll('a')].map(a => ({ text: a.innerText.trim(), href: a.href })).filter(x => x.text) } })())`, returnByValue: true })
console.log(JSON.stringify({ route, browser: version.Browser, result: JSON.parse(result.result?.result?.value ?? '{}') }))
ws.close()
