# Phase 10I Peer Comparison Layout Rebuild

This focused change rebuilds only the peer-comparison presentation. Financial formulas, API data, market data, valuation logic, methodology, and the approved P/E copy are unchanged.

- Desktop uses an explicit physical left/right grid: explanation `2fr`, data `3fr`, with the explanation in the left grid area.
- The data container is `width: 100%`, `min-width: 0`, and has no constraining max-width.
- Controls are top-aligned directly above the table.
- The table is `width: 100%`, `min-width: 650px`, `table-layout: fixed`, and keeps all four headers on one line.
- The table contains only `חברה`, `ערך המדד`, `חציון קבוצה`, and `פער מהחציון`.
- Below 1100px, controls/table come first and the explanation follows; overflow is confined to the table area.

Validation: `npm test` 31/31 passed, `npm run worker:test` 11/11 passed, `npm run worker:check` passed, and `npm run build` passed.

## Production evidence

- Pages deployment: `https://6a0122ff.israel-stocks.pages.dev`, source commit `f63d353`.
- At 1440px Chrome CDP measured explanation width `513.19px` at `x=55`, data width `769.81px` at `x=600.19`, and table width `769.81px` with right edge `x=1370`; this satisfies the required left/right geometry and leaves no large unused right-side area.
- Rendered headers were `חברה`, `ערך המדד`, `חציון קבוצה`, and `פער מהחציון`, all `nowrap` and visible. P/E values were `14.96×`, `13.29×`, `21.28×`, `26.16×`, and `10.90×`.
- Chrome CDP verified Sano, Shufersal, Rami Levy, Yochananof, Neto Malinda, and `/companies`: React rendered, market data was present on company routes, TTM remained unavailable, mock data was not detected, and console/runtime errors were zero.
