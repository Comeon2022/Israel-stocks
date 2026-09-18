# Phase 9E Neto and Globes Daily-Change Fix

## Baseline and raw provider capture

Phase 9D deployed Worker `30627801-5b63-4aad-a73b-5f1d8a0e1cc0` and activated validated FY2025 inputs for four companies. Neto report `1732821` remained blocked for ambiguous plain-PDF row ordering. The shared Globes parser currently exposes `change` without converting it, while ingestion and the Worker each divide the value by 100, causing an extra normalization step in production.

Raw official Globes fields captured from `source=tase.stocks.full`:

| Company | Instrument | `last` | `change` | `percentageChange` | `prevClose` | `ShareMarketCap` |
|---|---:|---:|---:|---:|---:|---:|
| Sano | 773 | 34680 | -70 | -0.20 | 34750 | 4261478 |
| Shufersal | 835 | 3683 | 25 | 0.68 | 3658 | 9771112 |
| Rami Levy | 26628 | 34450 | 550 | 1.62 | 33900 | 4745688 |
| Yochananof | 287570 | 34190 | 90 | 0.26 | 34100 | 4952654 |
| Neto Malinda | 26847 | 12110 | 470 | 4.04 | 11640 | 2528054 |

Globes `last`, `change`, and `prevClose` are agorot; `percentageChange` is percent; `ShareMarketCap` is thousands of NIS. Therefore canonical ILS values are `last/100`, `change/100`, and `prevClose/100`. The percentage field is preserved unchanged.

## Neto deterministic extraction baseline

Official report `1732821` attachments are resolved: HTML `H1732821.htm`, PDF `P1732821-00.pdf`, XBRL `X1732821.xbrl`. Consolidated statements are PDF pages 69-70 (balance), 71 (income), and 73 (cash flow), all in ILS thousands with FY2025/FY2024 comparatives. The HTML is an official report shell without structured statement tables. A layout-preserving PDF fallback is required for reliable row labels before any Neto write.

## Neto accepted evidence and dry-run

Coordinate-aware `pypdf` extraction retained row coordinates and resolved the FY2025/FY2024 columns:

| Target | Exact source label | Page | FY2025 raw | FY2024 raw | Normalized ILSm | Decision |
|---|---|---:|---:|---:|---:|---|
| Cash | מזומנים ושווי מזומנים | 69 | 24,483 | 38,536 | 24.483 | ACCEPT |
| Bank debt, current | אשראי מתאגידים בנקאיים | 70 | 234,253 | 36,038 | 234.253 | ACCEPT |
| Bank debt, non-current | אשראי מתאגידים בנקאיים | 70 | 1,382 | 1,424 | 1.382 | ACCEPT |
| CFO | מזומנים נטו, שנבעו מפעילות שוטפת | 73 | 60,655 | 324,262 | 60.655 | ACCEPT |
| PP&E Capex | רכישת רכוש קבוע | 73 | (42,089) | (41,488) | 42.089 positive outflow | ACCEPT |
| D&A | פחת והפחתות | 73 | 51,395 | 49,719 | 51.395 | ACCEPT |
| EBITDA | EBIT + D&A | pages 71,73 | 318.403 + 51.395 | 258.350 + 49.719 | 369.798 derived | ACCEPT |

Neto non-lease debt is `234.253 + 1.382 = 235.635` ILSm. Trade payables 463.573, employee/tax/other liabilities, and lease liabilities 7.163/42.884 are excluded. Capex is not total investing cash flow 15.735. Cash reconciles: balance-sheet cash 24.483 equals cash-flow closing cash 24.483. FCF is `60.655 - 42.089 = 18.566` ILSm.

Using live Neto market cap 2,528.054 ILSm, the dry-run is: net debt 211.152, EV 2,739.206, EV/EBIT 8.601, EV/EBITDA 7.406, P/FCF 136.160, FCF yield 0.7345%, net debt/market cap 8.352%. IFRS16-specific valuation remains NOT_APPLICABLE.

Source: `https://mayafiles.tase.co.il/rpdf/1732001-1733000/P1732821-00.pdf`, report `1732821`, official consolidated statements in ILS thousands. No LLM/OCR/unofficial source was used.

## Production daily-change matrix

The previous pipeline left the raw agorot change unconverted in the parser, divided it in ingestion, and divided it again in the Worker response. The centralized fix converts `change/100` in the shared parser, stores canonical ILS, and removes both downstream divisions.

| Company | Price before/after ILS | Market cap before/after ILSm | Percent before/after | Absolute before | Absolute after ILS | Arithmetic |
|---|---:|---:|---:|---:|---:|---|
| Sano | 346.80 / 346.80 | 4261.478 / 4261.478 | -0.20% / -0.20% | -0.007 | -0.70 | PASS: 346.80-347.50=-0.70 |
| Shufersal | 36.83 / 36.83 | 9771.112 / 9771.112 | 0.68% / 0.68% | 0.0025 | 0.25 | PASS: 36.83-36.58=0.25 |
| Rami Levy | 344.50 / 344.50 | 4745.688 / 4745.688 | 1.62% / 1.62% | 0.055 | 5.50 | PASS: 344.50-339.00=5.50 |
| Yochananof | 341.90 / 341.90 | 4952.654 / 4952.654 | 0.26% / 0.26% | 0.009 | 0.90 | PASS: 341.90-341.00=0.90 |
| Neto Malinda | 121.10 / 121.10 | 2528.054 / 2528.054 | 4.04% / 4.04% | 0.047 | 4.70 | PASS: 121.10-116.40=4.70 |

The percentage arithmetic agrees within normal provider rounding tolerance for all five. Worker deployment version is `15a2f93b-4519-4757-887b-6ddde2825a30`.

## Neto production valuation

Live API after persistence returns FY2025 latest-annual: P/E 10.8971, EV 2,739.206, EV/EBIT 8.6030, EV/EBITDA 7.4073, P/FCF 136.1658, FCF Yield 0.7344%, Net Debt/Market Cap 8.352%. Independent calculations from the persisted inputs passed; price, market cap, and P/E did not regress. Neto remains NOT_APPLICABLE for IFRS16-specific valuation.
