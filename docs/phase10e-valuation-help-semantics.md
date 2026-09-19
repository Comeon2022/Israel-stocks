# Phase 10E Valuation Help Semantics

## Baseline and root cause

Valuation cards reused the generic `MetricHelp` fallback when no explicit metric key/value was supplied. As a result, available P/E, EV, and other metrics could show an availability explanation instead of explaining the actual financial value. The peer table also displayed raw numbers under the ambiguous `ערך חברה` heading.

## Implementation

Added value-aware glossary helpers that preserve the static concept definition while describing the actual displayed value and unit. Multiples render with `×`, percentage metrics with `%`, and EV amounts retain ILS million/billion semantics. Negative Net Debt / Market Cap is explicitly explained as net cash. Peer comparison now uses `ערך המדד`, formats values by metric, explains the selected number, peer median, and delta in the same unit, and shows deterministic metric-specific unavailable reasons.

No formulas, backend values, API contracts, market data, valuation methodology, TTM, ROIC, or score `/15` were changed.

## Verification log

Automated checks, Pages deployment, and Chrome CDP evidence will be appended after deployment.
