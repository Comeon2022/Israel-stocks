# Phase 10E Valuation Help Semantics

## Baseline and root cause

Valuation cards reused the generic `MetricHelp` fallback when no explicit metric key/value was supplied. As a result, available P/E, EV, and other metrics could show an availability explanation instead of explaining the actual financial value. The peer table also displayed raw numbers under the ambiguous `ערך חברה` heading.

## Implementation

Added value-aware glossary helpers that preserve the static concept definition while describing the actual displayed value and unit. Multiples render with `×`, percentage metrics with `%`, and EV amounts retain ILS million/billion semantics. Negative Net Debt / Market Cap is explicitly explained as net cash. Peer comparison now uses `ערך המדד`, formats values by metric, explains the selected number, peer median, and delta in the same unit, and shows deterministic metric-specific unavailable reasons.

No formulas, backend values, API contracts, market data, valuation methodology, TTM, ROIC, or score `/15` were changed.

## Regression correction

The first production browser pass exposed a value-extractor type bug for EV: the numeric data attribute was treated as a string before parsing. The extractor now stringifies values safely before numeric parsing. This was a presentation-only fix; the underlying EV value and API response were unchanged.

## Verification log

Automated checks, Pages deployment, and Chrome CDP evidence will be appended after deployment.

## Production closeout

Pages deployment `c1dee850.israel-stocks.pages.dev` was built from source commit `ae217472fc42943234fa83a05fad935f600415c0`; the production domain was verified after hydration. Chrome CDP passed all five company routes and `/companies` with zero console/runtime errors. Direct interaction verification confirmed popover open, outside pointer close, single-open replacement, and Escape close. Sano P/E help rendered `14.96×` with its actual-number explanation. Peer output uses metric-aware units and the `ערך המדד` heading. Worker was not redeployed.
