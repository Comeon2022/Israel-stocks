import { useEffect, useRef, useState } from 'react'
import { glossaryFor } from '../lib/metricGlossary'

export function MetricHelp({ metric, compact = false }: { metric: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const item = glossaryFor(metric)
  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => { if (open && ref.current && !ref.current.contains(event.target as Node)) setOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    const closeOthers = (event: Event) => { if ((event as CustomEvent).detail !== ref.current) setOpen(false) }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('metric-help-open', closeOthers)
    return () => { document.removeEventListener('pointerdown', closeOnOutside); document.removeEventListener('keydown', closeOnEscape); document.removeEventListener('metric-help-open', closeOthers) }
  }, [open])
  const toggle = () => { const next = !open; if (next) document.dispatchEvent(new CustomEvent('metric-help-open', { detail: ref.current })); setOpen(next) }
  return <span ref={ref} className={`metric-help ${open ? 'is-open' : ''}`}><button type="button" aria-label={`הסבר: ${item.label}`} aria-expanded={open} aria-controls={`metric-help-${item.key}`} title={item.explanation} onClick={toggle}>?</button>{open && <span id={`metric-help-${item.key}`} role="tooltip" className={`metric-tooltip ${compact ? 'compact' : ''}`}><b>{item.label}</b>{item.fullNameEn && <span dir="ltr">{item.fullNameEn}</span>}<span>{item.explanation}</span><span>{item.meaning}</span>{item.hint && <small>{item.hint}</small>}{item.caution && <small>{item.caution}</small>}</span>}</span>
}
