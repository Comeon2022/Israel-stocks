# Phase 8G browser UI verification

## Scope

This document records real browser verification of the production React UI for Phase 8G. It does not replace API or static HTTP checks.

## Browser method

Chrome `153.0.8010.48` was launched headlessly with remote debugging enabled. A Node script used the Chrome DevTools Protocol over WebSocket, navigated each production route, executed JavaScript in the page, waited for React rendering, read `document.body.innerText`, and collected console/runtime events. The initial Chrome `--headless --dump-dom` method produced no DOM output, so CDP was used as the second browser automation method.

## Initial state

Production Pages deployment was `51b649d3-1207-4646-b599-b1ee673d22af`, branch `main`, source commit `94a63b5`. The Worker deployment in the current handoff is `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`.

## Verification status

## Rendered DOM results

All six required routes were navigated in Chrome and inspected after a five-second React render wait:

| Route | Rendered data | Period rows | Market/source | Console/runtime |
|---|---|---|---|---|
| `/company/shufersal` | Yes | FY2023, FY2024, 2025 Q2, FY2025, 2026 Q2 | Globes, ~15 minutes | 0 errors |
| `/company/rami-levy` | Yes | FY2023, FY2024, 2025 Q2, FY2025, 2026 Q2 | Globes, ~15 minutes | 0 errors |
| `/company/yochananof` | Yes | FY2023, FY2024, 2025 Q2, FY2025, 2026 Q2 | Globes, ~15 minutes | 0 errors |
| `/company/neto-malinda` | Yes | FY2023, FY2024, 2025 Q2, FY2025, 2026 Q2 | Globes, ~15 minutes | 0 errors |
| `/company/sano` | Yes | FY2023, FY2024, FY2025, 2026 Q2 | Globes, ~15 minutes | 0 errors |
| `/companies` | Yes; five company cards/links | Not applicable | Five cards marked `SOURCE_BACKED` | 0 errors |

The rendered company pages show annual basis `2025-12-31`; interim rows remain `QUARTER_ONLY`. No duplicate period rows were visible. The rendered valuation area shows unavailable IFRS16/TTM-dependent metrics with Hebrew explanations, and the market source line shows Globes and the delay. Neto Malinda has no retailer-specific source-backed IFRS16 values. Sano retains its four-row history and FY2025 annual basis.

## API/UI comparison

The browser-visible period sets and market source matched the live API checks recorded for all five companies: peers expose five financial rows and Sano exposes four; each uses the FY2025 annual row for annual valuation basis, while 2026 remains interim. The `/companies` cards link to all five canonical routes and label them `SOURCE_BACKED`.

The global shell still contains a legacy `Prototype`/demo-environment footer label. This is presentation copy only; DOM inspection and API comparison show no mock market or valuation fallback on the activated company routes. No backend or financial logic was changed in Phase 8G.

## Completion

## Final closeout

The pushed commit is `564c56cd62d820731838a1f41e2b6ab627148cd6`; local `HEAD` equals `origin/main`. Cloudflare Pages deployment `b67b8fc6-aae8-4f9d-8c87-17fa0f72aa24` is Active for source commit `564c56c` at `https://b67b8fc6.israel-stocks.pages.dev` and serves the production site. The existing Worker deployment remains `9ea03bff-d060-43e7-b62e-4c04f3ea4a3e`; no Worker code changed in Phase 8G.

Final checks: `npm test` passed (7 files, 15 tests); `npm run worker:test` passed (5 files, 8 tests); `npm run worker:check` passed; `npm run build` passed. The scoped Phase 8G changes were pushed to `origin/main`. Pre-existing unrelated `.gitignore` changes and the untracked `buildorder/` directory were not staged.
