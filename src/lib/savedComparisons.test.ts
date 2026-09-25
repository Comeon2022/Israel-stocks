// @ts-nocheck
import {describe,expect,it} from 'vitest'
import {readSavedComparisons,saveComparison,validComparisonIds} from './savedComparisons'
const universe=['castro','fox','isrotel','dan-hotels']
describe('saved comparisons',()=>{it('validates and deduplicates IDs',()=>expect(validComparisonIds(['CASTRO','castro','bad','fox'],universe)).toEqual(['castro','fox']));it('saves and updates an exact set',()=>{const s:any={};const first=saveComparison(s,[],'Retailers',['castro','fox'],universe);expect(first.sets).toHaveLength(1);const second=saveComparison(s,first.sets,'New name',['castro','fox'],universe);expect(second.sets).toHaveLength(1);expect(second.sets[0].name).toBe('New name')});it('handles malformed storage',()=>{const s:any={getItem:()=>'{bad'};expect(readSavedComparisons(s,universe)).toEqual([])})})
