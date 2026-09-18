import { describe, expect, it } from 'vitest'
import { buildAnalytics, peerComparison } from './analytics'

const row=(year:number,revenue:number,ebit:number,ni:number,cfo:number,capex:number)=>({id:`${year}`,fiscal_year:year,period_end:`${year}-12-31`,period_type:'ANNUAL',flow_basis:'ANNUAL',source_ids_json:'[]',revenue,operating_income:ebit,net_income:ni,cash_flow_from_operations:cfo,capex,gross_profit:revenue*.3})
describe('annual analytics',()=>{
  it('calculates margins, growth, FCF and rejects unavailable ROIC',()=>{const a=buildAnalytics([row(2024,100,20,10,12,4),row(2025,120,30,15,18,6)]);expect(a.annual[1].fcf.value).toBe(12);expect(a.annual[1].ebitMargin.value).toBe(.25);expect(a.annual[1].revenueGrowth.value).toBe(.2);expect(a.roic.available).toBe(false);expect(a.roic.reason).toBe('ROIC_FORMULA_NOT_APPROVED')})
  it('rejects sign-change CAGR',()=>{const a=buildAnalytics([row(2023,100,20,10,2,4),row(2024,90,10,5,3,4),row(2025,80,5,-2,1,4)]);expect(a.cagr.netIncome.available).toBe(false);expect(a.cagr.netIncome.reason).toBe('SIGN_CHANGE_CAGR_UNDEFINED')})
  it('calculates deterministic peer medians and deltas',()=>{const r=peerComparison([{companyId:'a',x:1},{companyId:'b',x:2},{companyId:'c',x:3}],'x');expect(r[0].peerMedian).toBe(2);expect(r[2].deltaVsPeerMedian).toBe(1)})
})
