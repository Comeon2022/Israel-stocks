# Phase 10D Financial Knowledge Accessibility

## Baseline

Phase 10C had reusable Hebrew metric help, but each popover was locally controlled and could remain open. Glossary entries were concise labels rather than beginner-level definitions, and the peer panel did not expose the full educational context.

## Implementation

The glossary now includes acronym/full-name expansion, Hebrew definition, plain-language meaning, interpretation guidance, and cautions for EBITDA, EBIT, FCF, CFO, EV, P/E, Capex, D&A, IFRS 16, peer median, TTM, and annual basis. `MetricHelp` uses a reusable document event so only one help popover is open; pointer-down outside closes it, Escape closes it, and the trigger is keyboard accessible. The existing peer explanation panel consumes the same glossary and changes with the selected metric.

No formulas, API contracts, market data, valuation methodology, D1 data, TTM, ROIC, or score `/15` were changed.

## Verification log

Automated checks, Pages deployment, and Chrome CDP interaction evidence will be appended after verification.

## Implementation milestone

The shared glossary now provides full English expansions, plain Hebrew definitions, interpretation guidance, and cautions. `MetricHelp` closes on outside pointer/touch interaction, Escape, and opening another help trigger; its button exposes `aria-expanded`, `aria-controls`, and an accessible label. The peer explanation panel uses the same educational glossary content, and unavailable data continues to remain null with deterministic backend reasons.

## Production closeout

Pages deployment `f78f326e.israel-stocks.pages.dev` was built from source commit `1750b5a3f5320bd82637e4a89ca23ac2c9bb1e71`; the production domain was verified after React hydration. Chrome CDP passed all five company routes and `/companies` with zero console/runtime errors. Hebrew company names, market/valuation behavior, annual facts, quarter-only financial rows, and explicit unavailable states were preserved. Worker was not redeployed because no backend code changed.
