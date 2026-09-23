import { describe, expect, it } from 'vitest'
import { bindNumericCells, clusterVisualRows, detectYearColumnMap, normalizeCashOutflow, parseGeometryNumber } from './pdfTableGeometry'

describe('deterministic PDF cash-flow geometry binding', () => {
  const rows = clusterVisualRows([
    { text: '2024', x: 300, y: 100 }, { text: '2023', x: 220, y: 100 }, { text: 'ביאור', x: 170, y: 100 }, { text: '31 בדצמבר', x: 100, y: 100 },
    { text: '(', x: 290, y: 80 }, { text: '200', x: 300, y: 80 }, { text: '(', x: 210, y: 80 }, { text: '180', x: 220, y: 80 }, { text: '3', x: 170, y: 80 }, { text: 'רכישת רכוש קבוע', x: 20, y: 80 },
  ])
  it('maps explicit year headers by x-coordinate, not token order', () => {
    const map = detectYearColumnMap(rows, [2024, 2023])
    expect(map.confidence).toBe('HIGH')
    expect(map.years[2024]).toBe(300)
    expect(map.years[2023]).toBe(220)
  })
  it('excludes note integers and binds RTL rows to years', () => {
    const map = detectYearColumnMap(rows, [2024, 2023])
    expect(bindNumericCells(rows[1], map)).toEqual([{ year: 2023, value: -180, x: 220 }, { year: 2024, value: -200, x: 300 }])
  })
  it('rejects ambiguity and preserves sign/unit rules', () => {
    expect(parseGeometryNumber('(1,200)')).toBe(-1200)
    expect(normalizeCashOutflow(-1200, 'THOUSANDS_ILS')).toBe(1.2)
    expect(bindNumericCells([{ text: '100', x: 250, y: 1 }], { years: { 2024: 250, 2023: 250 }, noteColumnX: null, labelRegion: { min: -Infinity, max: 0 }, confidence: 'HIGH' })).toBeNull()
  })
})
