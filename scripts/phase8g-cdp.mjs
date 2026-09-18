import { execFileSync } from 'node:child_process'
const routes=process.argv.slice(2).length?process.argv.slice(2):['company/shufersal','company/rami-levy','company/yochananof','company/neto-malinda','company/sano','companies']
const port=9222
const version=await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
const page=(await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x=>x.type==='page')
const ws=new WebSocket(page.webSocketDebuggerUrl);let seq=0;const pending=new Map();const logs=[]
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.consoleAPICalled'||m.method==='Runtime.exceptionThrown')logs.push(m);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}}
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
const send=(method,params={})=>new Promise(resolve=>{const id=++seq;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}))})
await send('Runtime.enable');await send('Page.enable')
const wait=ms=>new Promise(r=>setTimeout(r,ms))
for(const route of routes){logs.length=0;await send('Page.navigate',{url:`https://israel-stocks.pages.dev/${route}`});await wait(5000);const r=await send('Runtime.evaluate',{expression:`JSON.stringify({text:document.body.innerText,href:location.href,title:document.title})`,returnByValue:true});const v=JSON.parse(r.result?.result?.value??'{}');const text=v.text??'';console.log(JSON.stringify({route,href:v.href,title:v.title,chars:text.length,hasReact:text.length>0,periods:[2023,2024,2025,2026].map(y=>[y,text.includes(String(y))]),market:/Globes|₪|market|מחיר/.test(text),ttmUnavailable:/unavailable|לא זמין|אין נתון|TTM/i.test(text),mock:/MOCK|מקומי|דמה/.test(text),errors:logs.length}))}
console.log(JSON.stringify({browserVersion:version.Browser,consoleEvents:logs.length}))
ws.close()
