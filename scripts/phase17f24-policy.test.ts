import {describe,it,expect} from 'vitest'
import {DatabaseSync} from 'node:sqlite'
import {manifest,writeMode,assertTarget,transition,regressionFailures,deriveFcf,proposedFields,activationSql} from './phase17f24-policy'

const e=(semantic:string,value:number)=>({semantic,normalized:value,targetYear:2025,raw:-value*1000,unit:'THOUSANDS_ILS',yearColumnX:240,rowY:580,rawNumericText:String(value*1000),title:'Consolidated cash flows'})
const result=(extra:any={})=>({companyId:'fox',reportId:'1729790',periodId:'fox-maya-1729790',year:2025,identityVerified:true,scope:'CONSOLIDATED',source:{id:'official',url:'https://mayafiles.tase.co.il/rpdf/P1729790-00.pdf',sha256:'a'.repeat(64)},structuralConfidence:'HIGH',capexPpe:535.992,capexIntangibles:null,totalCapex:null,evidence:[e('PURE_PPE',535.992),e('MIXED_INTANGIBLE_EVICTION_FEES',31.059)],...extra})
describe('Phase 17F.24 activation safety',()=>{
  it('locks the exact 30 reports and canonical company/year identities',()=>{
    expect(manifest).toHaveLength(30)
    expect(new Set(manifest.map(t=>t.reportId)).size).toBe(30)
    expect(manifest.map(t=>t.reportId).join(',')).toBe('1582703,1653980,1730561,1581569,1653470,1730885,1581930,1653740,1730597,1581475,1654283,1729790,1581936,1651959,1727874,1575392,1645562,1722944,1581072,1649844,1728277,1582679,1654590,1731729,1582604,1653647,1731504,1580895,1654593,1732438')
    expect(manifest.every(t=>[2023,2024,2025].includes(t.year))).toBe(true)
  })
  it('defaults to zero-write and requires an unambiguous explicit write flag',()=>{
    expect(writeMode([])).toBe(false);expect(writeMode(['--dry-run'])).toBe(false)
    expect(writeMode(['--write'])).toBe(true)
    expect(()=>writeMode(['--write','--dry-run'])).toThrow()
    expect(()=>activationSql([],['GATE_FAILED'])).toThrow('ACTIVATION_BLOCKED')
  })
  it('requires HIGH, consolidated scope, and complete source identity',()=>{
    expect(proposedFields(result({structuralConfidence:'LOW'}))).toEqual([])
    expect(proposedFields(result({scope:'PARENT_ONLY'}))).toEqual([])
    expect(proposedFields(result({source:null}))).toEqual([])
  })
  it('allows pure partial components without accepting mixed rows or total',()=>{
    expect(proposedFields(result()).map(f=>f.field)).toEqual(['capexPpe'])
    expect(proposedFields(result({capexIntangibles:31.059,totalCapex:567.051})).map(f=>f.field)).toEqual(['capexPpe'])
  })
  it('accepts total only with both pure components and explicit requested-year cells',()=>{
    const r=result({capexIntangibles:5,totalCapex:540.992,evidence:[e('PURE_PPE',535.992),e('PURE_INTANGIBLE',5)]})
    expect(proposedFields(r).map(f=>f.field)).toEqual(['capexPpe','capexIntangibles','capex'])
    r.evidence[0].targetYear=2024
    expect(proposedFields(r).map(f=>f.field)).toEqual(['capexIntangibles'])
  })
  it('enforces all nine regression outcomes without later-comparative substitution',()=>{
    const expected:any={strauss:[[null,133,null],[null,143,null],[null,102,null]],fox:[[303.373,null,null],[487.542,null,null],[535.992,null,null]],isrotel:[[243.792,3.552,247.344],[538.305,3.263,541.568],[315.516,5.144,320.660]]}
    const rows=Object.entries(expected).flatMap(([companyId,years]:any)=>years.map(([capexPpe,capexIntangibles,totalCapex]:any,i:number)=>({companyId,year:2023+i,capexPpe,capexIntangibles,totalCapex,structuralConfidence:'HIGH'})))
    expect(regressionFailures(rows)).toEqual([])
    rows.find(r=>r.companyId==='fox'&&r.year===2024)!.capexPpe=488.578
    expect(regressionFailures(rows)).toEqual(['fox/2024:REGRESSION_MISMATCH'])
  })
  it('requires source-backed CFO and canonical total; never synthesizes lease cash',()=>{
    expect(deriveFcf(100,null,true,null,false).fcf).toBeNull()
    expect(deriveFcf(100,20,false,null,false).fcf).toBeNull()
    expect(deriveFcf(100,20,true,null,false).fcf).toBe(80)
    expect(deriveFcf(100,20,true,12,false).adjustedFcf).toBeNull() // even if principal+interest were provided
    expect(deriveFcf(100,20,true,12,true).adjustedFcf).toBe(68)
  })
  it('classifies all existing-field transitions without automatic erasure',()=>{
    expect(transition(null,2)).toBe('NULL_TO_VALUE');expect(transition(2,2)).toBe('VALUE_TO_SAME_VALUE')
    expect(transition(2,3)).toBe('VALUE_TO_DIFFERENT_VALUE');expect(transition(2,null)).toBe('VALUE_TO_NULL')
    expect(transition(null,null)).toBe('NULL_TO_NULL')
  })
  it('protects original five and rejects alternate report identities',()=>{
    for(const id of ['sano','shufersal','rami-levy','yochananof','neto-malinda'])expect(()=>assertTarget(id,2025,'1731504')).toThrow()
    expect(()=>assertTarget('fox',2024,'1729790')).toThrow()
  })
  it('uses field-specific idempotent SQL without duplicating provenance or overwriting other fields',()=>{
    const db=new DatabaseSync(':memory:')
    db.exec('CREATE TABLE financial_statements(period_id TEXT PRIMARY KEY,company_id TEXT,capex REAL,revenue REAL);CREATE TABLE financial_field_provenance(id TEXT PRIMARY KEY,company_id TEXT,period_id TEXT,field TEXT,concept TEXT,context_id TEXT,unit TEXT,raw_value TEXT,normalized_value REAL,provenance_type TEXT,created_at TEXT,UNIQUE(period_id,field));')
    db.exec("INSERT INTO financial_statements VALUES('isrotel-maya-1731504','isrotel',NULL,100)")
    const p={companyId:'isrotel',year:2025,reportId:'1731504',periodId:'isrotel-maya-1731504',field:'capex',value:320.660,provenance:{test:'fixture'}}
    const sql=activationSql([p],[]);db.exec(sql)
    const first=db.prepare('SELECT * FROM financial_field_provenance').all()
    db.exec(sql)
    expect(db.prepare('SELECT * FROM financial_field_provenance').all()).toEqual(first)
    expect(db.prepare('SELECT capex,revenue FROM financial_statements').get()).toEqual({capex:320.660,revenue:100})
    expect(()=>activationSql([{...p,companyId:'sano'}],[])).toThrow()
    db.close()
  })
})
