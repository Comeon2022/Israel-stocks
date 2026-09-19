# Phase 10I Peer Comparison Layout Rebuild

This focused change rebuilds only the peer-comparison presentation. Financial formulas, API data, market data, valuation logic, methodology, and the approved P/E copy are unchanged.

- Desktop uses an explicit physical left/right grid: explanation `2fr`, data `3fr`, with the explanation in the left grid area.
- The data container is `width: 100%`, `min-width: 0`, and has no constraining max-width.
- Controls are top-aligned directly above the table.
- The table is `width: 100%`, `min-width: 650px`, `table-layout: fixed`, and keeps all four headers on one line.
- The table contains only `חברה`, `ערך המדד`, `חציון קבוצה`, and `פער מהחציון`.
- Below 1100px, controls/table come first and the explanation follows; overflow is confined to the table area.

Validation: `npm test` 31/31 passed, `npm run worker:test` 11/11 passed, `npm run worker:check` passed, and `npm run build` passed.
