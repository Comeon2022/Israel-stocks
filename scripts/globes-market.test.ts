import { describe, expect, it } from 'vitest'
import { GLOBES_MAP, parseGlobesInstrument } from './globes-market'

const xml=(security:string,last:number,change:number,pct:number,prev:number,cap=1000000)=>`<root><symbol>${security}</symbol><exchange>tase</exchange><currency>NIS</currency><last>${last}</last><change>${change}</change><percentageChange>${pct}</percentageChange><prevClose>${prev}</prevClose><ShareMarketCap>${cap}</ShareMarketCap><numpapers>1000000</numpapers><GTOSymbol>TEST</GTOSymbol><timestamp>t</timestamp></root>`

describe('Globes canonical units',()=>{
  it.each([
    ['strauss',277,'746016'],['victory',53944,'1123777'],['tiv-taam',286,'103010'],['fox',4758,'1087022'],['max-stock',325647,'1168558'],['delta-israel-brands',346291,'1173699'],['castro',154,'280016'],['diplomat',346203,'1173491'],['isrotel',443,'1080985'],['dan-hotels',199,'822015'],
  ])('keeps verified expanded mapping for %s', (company,id,security)=>{expect(GLOBES_MAP[company as keyof typeof GLOBES_MAP]).toMatchObject({id,security})})
  it('rejects an identity mismatch before activation',()=>expect(()=>parseGlobesInstrument(xml('wrong',100,0,0,100),'strauss')).toThrow('GLOBES_IDENTITY_OR_PRICE_ERROR'))
  it('normalizes absolute change from agorot once',()=>{
    const s=parseGlobesInstrument(xml('813014',34680,-70,-0.2,34750),'sano')
    expect(s.priceIls).toBe(346.8)
    expect(s.dayChange).toBe(-0.7)
    expect(s.previousCloseIls).toBe(347.5)
    expect(s.dayChangePct).toBe(-0.2)
  })
  it.each([
    ['sano','813014',34680,-70,-0.2,34750],['shufersal','777037',3683,25,0.68,3658],['rami-levy','1104249',34450,550,1.62,33900],['yochananof','1161264',34190,90,0.26,34100],['neto-malinda','1105097',12110,470,4.04,11640],
  ])('keeps price/change/percent consistent for %s', (company,security,last,change,pct,prev)=>{
    const s=parseGlobesInstrument(xml(security,last,change,pct,prev),company)
    expect(s.priceIls - s.previousCloseIls!).toBeCloseTo(s.dayChange!,2)
    expect((s.dayChange!/s.previousCloseIls!)*100).toBeCloseTo(s.dayChangePct!,1)
  })
})
