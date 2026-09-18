import { describe, expect, it } from 'vitest'
import worker from './index'

const rows=[
  {id:'fy',company_id:'test',fiscal_year:2025,period_type:'ANNUAL',period_end:'2025-12-31',flow_basis:'ANNUAL',source_ids_json:'[]',revenue:100,operating_income:10,net_income:8},
  {id:'q25',company_id:'test',fiscal_year:2025,period_type:'QUARTERLY',period_end:'2025-06-30',flow_basis:'QUARTER_ONLY',source_ids_json:'[]',revenue:20,operating_income:2,net_income:1},
  {id:'q26',company_id:'test',fiscal_year:2026,period_type:'QUARTERLY',period_end:'2026-06-30',flow_basis:'QUARTER_ONLY',source_ids_json:'[]',revenue:22,operating_income:2,net_income:1},
]
const db={prepare(sql:string){return {bind(){return {all:async<T>()=>sql.includes('financial_periods')?{results:rows as T[]}:{results:[] as T[]},first:async<T>()=>null as T|null,run:async()=>({})}}}}} as any
const env={DB:db}
describe('Worker API route semantics',()=>{
  it('returns health',async()=>{const r=await worker.fetch(new Request('https://x/api/health'),env);expect(r.status).toBe(200);expect((await r.json()).status).toBe('ok')})
  it('filters periods and rejects invalid values',async()=>{const a=await worker.fetch(new Request('https://x/api/companies/test/financials?periodType=ANNUAL'),env);expect((await a.json()).financials).toHaveLength(1);const q=await worker.fetch(new Request('https://x/api/companies/test/financials?periodType=QUARTERLY'),env);expect((await q.json()).financials).toHaveLength(2);const bad=await worker.fetch(new Request('https://x/api/companies/test/financials?periodType=BAD'),env);expect(bad.status).toBe(400)})
  it('returns distinct latest and ttm contracts',async()=>{const latest=await worker.fetch(new Request('https://x/api/companies/test/financials/latest'),env);expect((await latest.json()).financial).toBeTruthy();const t=await worker.fetch(new Request('https://x/api/companies/test/financials/ttm'),env);const body=await t.json();expect(body.ttm).toBeTruthy();expect(body.ttm.available).toBe(false);expect(body.financials).toBeUndefined()})
})
