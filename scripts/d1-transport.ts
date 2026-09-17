import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
export function resolveWranglerEntrypoint(){const req=createRequire(import.meta.url);const pkg=req.resolve('wrangler/package.json');const meta=JSON.parse(readFileSync(pkg,'utf8'));const bin=typeof meta.bin==='string'?meta.bin:meta.bin.wrangler;return join(dirname(pkg),bin)}
export function executeRemoteD1Sql(sql:string){const dir=mkdtempSync(join(tmpdir(),'israel-stocks-'));const file=join(dir,'batch.sql');writeFileSync(file,sql,'utf8');try{return execFileSync(process.execPath,[resolveWranglerEntrypoint(),'d1','execute','israel-stocks-db','--remote','--file',file],{shell:false,encoding:'utf8',stdio:'inherit'})}finally{try{unlinkSync(file)}catch{}}}
