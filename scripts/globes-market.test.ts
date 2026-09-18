import { describe, expect, it } from 'vitest'
import { parseGlobesInstrument } from './globes-market'

const xml=(security:string,last:number,change:number,pct:number,prev:number,cap=1000000)=>`<root><symbol>${security}</symbol><exchange>tase</exchange><currency>NIS</currency><last>${last}</last><change>${change}</change><percentageChange>${pct}</percentageChange><prevClose>${prev}</prevClose><ShareMarketCap>${cap}</ShareMarketCap><numpapers>1000000</numpapers><GTOSymbol>TEST</GTOSymbol><timestamp>t</timestamp></root>`

describe('Globes canonical units',()=>{
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
