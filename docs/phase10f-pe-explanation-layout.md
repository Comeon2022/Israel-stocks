# Phase 10F P/E Explanation Layout

## Baseline audit

Phase 10E had value-aware valuation help and a two-column peer explanation area, but Market Data cards inherited generic metric help, the peer selector retained a redundant help trigger, and the P/E panel copy was not the approved beginner-friendly structure.

## Planned correction

- Suppress help affordances for Last Price, Market Cap, and Daily Change only.
- Hide the redundant selector help trigger; the large left explanation panel remains authoritative.
- Use the approved P/E meaning with a dynamic current value.
- Preserve `ערך המדד`, metric-aware `×`/`%` formatting, calculations, API values, and methodology.

## Implementation milestone

Market Data labels are now excluded from the help affordance, the peer selector's redundant trigger is visually removed, and the P/E glossary label/meaning follows the approved beginner-friendly structure. The peer table and left-side panel retain dynamic values and metric-aware units.
