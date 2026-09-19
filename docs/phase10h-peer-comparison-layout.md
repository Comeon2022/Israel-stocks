# Phase 10H Peer Comparison Layout

## Scope

This focused change modifies only peer-comparison presentation. The approved P/E copy, formulas, API data, market data, valuation logic, and methodology are preserved.

## Implementation

- Explicit desktop grid uses a 40/60 explanation/data split.
- Explanation remains physically left; controls and full-width table occupy the right.
- Controls are aligned at the top of the data column.
- Table headers/cells stay horizontal and readable without vertical wrapping.
- The redundant selected-metric column is removed from the rendered table; the selector already identifies the metric.
- Tablet/mobile layouts stack data first and explanation below without page overflow.

## Validation

- `npm test`: passed, 10 files / 31 tests.
- `npm run worker:test`: passed, 6 files / 11 tests.
- `npm run worker:check`: passed.
- `npm run build`: passed.

## Production verification

- Pages deployment: `https://dc8fb6ac.israel-stocks.pages.dev`, deployed from source commit `606d720` (`606d720...`). The existing Pages project was used; no Worker deployment was needed.
- Chrome CDP at 1440px verified Sano geometry: explanation `x=55`, peer data/table `x=496`, therefore the explanation is physically left of the table.
- The rendered table headers were exactly `חברה`, `ערך המדד`, `חציון קבוצה`, `פער מהחציון`; no `מדד` column was present, no headers wrapped vertically, and values were `14.96×`, `13.29×`, `21.28×`, `26.16×`, `10.90×`.
- Chrome CDP verified all five company routes and `/companies`: React rendered, market data was present on company pages, TTM remained unavailable, mock data was not detected, and there were zero console/runtime errors.
