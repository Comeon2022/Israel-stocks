import { describe,expect,it } from 'vitest'
import { epsilonShock,hypotheticalWeights,pearson,removeRule,ruleContribution,stats,thresholdDistance } from './phase17bAudit'
const dimension:any={score:10,maxScore:20,rawPoints:10,availableMax:20,rules:[{ruleId:'A',points:6,maxPoints:10,available:true,value:1},{ruleId:'B',points:4,maxPoints:10,available:true,value:2}]}
describe('Phase 17B audit helpers',()=>{
 it('calculates contribution and threshold distances without mutation',()=>{const before=JSON.stringify(dimension);expect(ruleContribution(dimension,dimension.rules[0],50).percentOfTotal).toBe(12);const x=thresholdDistance(0.15,[0,.1,.2],6,8,4);expect(x.absoluteDistanceToNextHigher).toBeCloseTo(.05);expect(JSON.stringify(dimension)).toBe(before)})
 it('simulates epsilon shocks and evidence removal',()=>{expect(epsilonShock(10,.1,x=>x>=10?2:1)).toMatchObject({below:1,baseline:2,above:2});expect(removeRule(dimension,'A')).toMatchObject({availableMax:10,score:null,status:'INSUFFICIENT_EVIDENCE'})})
 it('normalizes hypothetical weights and computes diagnostics',()=>{expect(hypotheticalWeights({q:dimension},{q:25}).q).toBe(12.5);expect(pearson([1,2,3],[1,2,3])).toBeCloseTo(1);expect(stats([1,2,3]).median).toBe(2)})
})
