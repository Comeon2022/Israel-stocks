import { useState } from 'react'
import { glossaryFor } from '../lib/metricGlossary'

export function MetricHelp({ metric, compact = false }: { metric: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const item = glossaryFor(metric)
  return <span className={`metric-help ${open ? 'is-open' : ''}`}><button type="button" aria-label={`הסבר: ${item.label}`} title={item.explanation} onClick={() => setOpen(value => !value)}>?</button>{open && <span role="tooltip" className={`metric-tooltip ${compact ? 'compact' : ''}`}><b>{item.label}</b><span>{item.explanation}</span>{item.hint && <small>{item.hint}</small>}</span>}</span>
}
