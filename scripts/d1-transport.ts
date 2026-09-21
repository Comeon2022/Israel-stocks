import { execFileSync } from 'node:child_process'
import { mkdtempSync,writeFileSync,unlinkSync,readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname,join } from 'node:path'
import { createRequire } from 'node:module'
export function resolveWranglerEntrypoint(){const req=createRequire(import.meta.url),pkg=req.resolve('wrangler/package.json'),meta=JSON.parse(readFileSync(pkg,'utf8')),bin=typeof meta.bin==='string'?meta.bin:meta.bin.wrangler;return join(dirname(pkg),bin)}
function tempSql(sql:string){const dir=mkdtempSync(join(tmpdir(),'israel-stocks-')),file=join(dir,'query.sql');writeFileSync(file,sql,'utf8');return file}
export function executeRemoteD1Sql(sql:string){const file=tempSql(sql);try{return execFileSync(process.execPath,[resolveWranglerEntrypoint(),'d1','execute','israel-stocks-db','--remote','--yes','--file',file],{shell:false,encoding:'utf8',stdio:'inherit'})}finally{try{unlinkSync(file)}catch{}}}
export function executeRemoteD1Query<T=Record<string,unknown>>(sql:string):T[]{const out=execFileSync(process.execPath,[resolveWranglerEntrypoint(),'d1','execute','israel-stocks-db','--remote','--yes','--json','--command',sql],{shell:false,encoding:'utf8'}),start=out.indexOf('[\n');if(start<0)throw new Error('D1 query JSON result not found');const payload=JSON.parse(out.slice(start));return (payload[0]?.results??[]) as T[]}
