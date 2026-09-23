# Phase 17F.23D — direct FY2025 token forensics

Executed `npx tsx scripts/phase17f23d-forensics.ts` on reports 1730561, 1729790 and 1731504 only. URLs came from the persisted Phase 23B `pdf-meta.json` files; the diagnostic checks report identity/official host and records a SHA-256 digest. The existing local pdfjs legacy import supplies text, transform, width, height, direction, font-size estimate and original per-page item index. Nothing imports a binder, normalizes money, computes Capex totals, or connects to D1.

All ten requested artifacts exist per report under untracked `tmp/phase17f23d/`. Visual rows use a two-point y grouping; raw item order is retained separately. RTL output reverses token order only, never characters inside a token. It is a diagnostic rendering, not an accepted semantic label. Strong-title flags deliberately retain false positives. Continuation files retain adjacent-page rows and numerical centers for comparison, not accepted continuation identities.

Coordinates below are PDF points with origin at the bottom left. `x` denotes token left edge; `center` is x + width/2. Values below are verbatim token observations, not accepted Capex.

## Strauss — 1730561

Likely primary cash-flow pages: **270–271**. Page 256 is a TOC hit; page 437 also has an English cash-flow title and must not be pooled with the primary statement. The original title matcher requires `תזרימי המזומנים`, but this issuer uses `תזרימי מזומנים` without the definite article.

Page 270 title at y=741.46 is two raw tokens: `דוחות על תזרימי` (x=465.94, width=67.54), then `מזומנים מאוחדים` (x=390.31, width=73.20). Ascending x reverses those chunks. An additional token at y=724.78 contains the complete title `דוחות על תזרימי מזומנים מאוחדים`, with unusually narrow width 12.91 at x=525.94. Treat duplicate text layers as diagnostic evidence rather than a second statement.

Date/year block has two rows: `לשנה שהסתיימה ביום | 31 | בדצמבר` at y=716.74, then explicit unsplit year tokens at y=705.22. Raw order is 2025, 2024, 2023; ascending x is reversed.

| Year | x | width | center |
|---|---:|---:|---:|
| 2025 | 216.65 | 15.87 | 224.585 |
| 2024 | 148.34 | 15.87 | 156.275 |
| 2023 | 80.06 | 15.87 | 87.995 |

Unit is one token `מיליוני ש"ח` at (135.50,694.06), width 41.45. The same row contains `באור` at x=282.05, center=289.985. The binder recognizes `ביאור`, not this spelling, and searches only the year row for it.

Capex-fragment observations:

| Row at y | Raw order after label | Ascending-x number tokens |
|---|---|---|
| 360.41: `השקעה ברכוש קבוע ונדל"ן להשקעה` | `(395)`, `(403)`, `(361)` | `(361)`@98.30; `(403)`@166.34; `(395)`@234.41 |
| 346.73: `השקעה בנכסים בלתי מוחשיים` | `(102)`, `(143)`, `(133)` | `(133)`@98.30; `(143)`@166.34; `(102)`@234.41 |

Each number is a complete parenthesized token, width 20.14. Their centers are displaced about 20 points from the year centers; future alignment checks must use several ordinary rows before approving a band. The PPE label explicitly includes investment property.

Page 271 repeats a fragmented title, date, years and unit. Year centers move to 215.585/145.595/75.515 for 2025/2024/2023 (y=703.90); note center moves to 302.945. Continuation columns cannot blindly reuse page-270 absolute x positions.

Root causes: TITLE_FRAGMENTATION, TITLE_FALSE_POSITIVE, HEADER_MULTILINE, HEADER_REPEATED, PAGE_CONTINUATION, OTHER (controlled-title spelling, note spelling and reference-year conflict). No split year tokens were observed in this primary header.

Post-inspection reference check: the earlier 361 and 133 observations are in the **FY2023 comparative columns**, not FY2025. The previously claimed 494.000 FY2025 reference is therefore not supported by this page's year binding. No replacement total was computed or activated.

## Fox — 1729790

Likely consolidated statement pages: **156–159**; investing rows are on **157**. Pages 158–159 contain noncash/acquisition annexes under repeated titles. Pages **294–295 are parent-company information**, despite containing the word consolidated in their longer titles.

Page 157 title is one token `דוחות מאוחדים על תזרימי המזומנים` at (377.95,776.40), width 160.72. The date/year block spans three rows: `לשנה שהסתיימה ביום` at y=748.42; `31 | בדצמבר` at y=738.34; 2025/2024/2023 at y=727.06. Unit `אלפי ש"ח` is one token at (132.38,714.94), width 42.53.

| Year | x | width | center |
|---|---:|---:|---:|
| 2025 | 214.37 | 19.96 | 224.35 |
| 2024 | 148.34 | 19.96 | 158.32 |
| 2023 | 78.98 | 19.96 | 88.96 |

There is no dedicated note header in this local header block. References are embedded in labels: the investment row at y=657.70 contains note integers 10 at x=395.23 and 16 at x=374.35. These are far to the right of the three financial columns. A footer containing `באורים` is not a note-column header.

| Row at y | Raw order after label (signs separate) | Ascending-x numbers |
|---|---|---|
| 680.26: `רכישת רכוש קבוע` | `(`, `535,992`, `)`, `(`, `488,578`, `)`, `(`, `303,373`, `)` | `303,373`@86.18; `488,578`@150.38; `535,992`@211.85 |
| 531.91: `רכישת נכסים בלתי מוחשיים ודמי פינוי` | `(`, `31,059`, `)`, `(`, `38,211`, `)`, `(`, `25,333`, `)` | `25,333`@91.22; `38,211`@155.42; `31,059`@216.89 |

Ascending x puts `)` to the left and `(` to the right of each value. The current binder checks the opposite neighboring parentheses, so it misses raw signs in this layout. Property investment is a separate row at y=668.62; consolidated company acquisitions are a separate row at y=634.42. In that acquisition row, one number is split into `75,93` and `5`. No total is computed here; the intangible label also contains eviction fees and needs semantic review before future acceptance.

Continuation pages repeat titles/date/years/unit. For example, page 156 year centers are 228.55/161.80/98.08 at y=722.38, whereas page 157 centers are 224.35/158.32/88.96. Page 158 has years at y=714.22; page 159 at y=719.86. Page-local geometry matters.

Root causes: TITLE_FALSE_POSITIVE, HEADER_MULTILINE, HEADER_REPEATED, NUMERIC_TOKEN_FRAGMENTATION, PAGE_CONTINUATION, OTHER (mirrored standalone parentheses and parent-scope reference conflict).

Post-inspection reference check: page 295's title is `נתונים כספיים מתוך הדוחות המאוחדים על תזרימי המזומנים המיוחסים לחברה`. Its observed tokens 226,316 and 9,038 are the rows cited in the prior pilot. Thus the claimed 235.354 consolidated reference was sourced from **parent-company information**, not the consolidated investing rows. No replacement reference is established in this phase.

## Isrotel — 1731504

Likely statement pages: **79–80**, with purchase rows on 79. Page 72 is auditor narrative; page 88 is accounting policy; pages 146–147 are parent-company cash-flow information. All can trigger broad page-wide title matching.

Title is one token `דוחות מאוחדים על תזרימי המזומנים` at (217.49,731.86), width 139.56. Date/year block has two rows: `שנה שהסתיימה ב | - | 31 | בדצמבר` at y=703.18, then `ביאור | 2025 | 2024 | 2023` in raw order at y=690.22. Unit `אלפי ש"ח` is one token at (162.02,677.14), width 40.24.

| Year | x | width | center |
|---|---:|---:|---:|
| 2025 | 234.89 | 22.10 | 245.94 |
| 2024 | 174.62 | 22.10 | 185.67 |
| 2023 | 110.78 | 22.10 | 121.83 |

The dedicated `ביאור` token has x=291.41, center=302.485. Notes 12 and 14 both start at x=296.81, width 11.06, center=302.34. This is direct evidence for a note band independent of value magnitude.

| Row at y | Raw order | Ascending-x financial numbers |
|---|---|---|
| 569.83: `רכישת רכוש קבוע` | label, `12`, `(`, `315,516`, `)`, `(`, `538,305`, `)`, `(`, `243,792`, `)` | `243,792`@101.66; `538,305`@165.50; `315,516`@229.37 |
| 546.79: `רכישת נכסים בלתי מוחשיים` | label, `14`, `(`, `5,144`, `)`, `(`, `3,263`, `)`, `(`, `3,552`, `)` | `3,552`@112.82; `3,263`@176.66; `5,144`@240.53 |

Parentheses again appear as `) number (` in ascending x. The year tokens themselves are not fragmented. Page 80 repeats title/date/year/unit; year centers change to 238.74/181.95/121.83 at y=695.86, and the note center changes to 292.045. The component observations do not show the Strauss/Fox reference-scope issues; this forensic phase still does not compute or accept the 320.660 reference total.

Root causes: TITLE_FALSE_POSITIVE, HEADER_MULTILINE, HEADER_REPEATED, PAGE_CONTINUATION, OTHER (mirrored standalone parentheses). Note-column coexistence is observed, but no collision is proved for the two purchase rows.

## Why the current code fails

1. `pdfStatementWindow.ts` finds words anywhere on a page, picks the first matching page, and appends two pages. TOCs, auditor prose, policy text and parent-company titles can all win. It does not implement a validated primary statement boundary.
2. Its header filter retains rows containing target years, dropping the separate date row. Flattening those year rows does not restore the missing date text. `detectYearColumnMap` then requires a date marker and a year in the same row.
3. Phase 23B pools tokens from multiple pages. Repeated year labels then fail uniqueness, even when each local header is individually clear. Phase 23C computes `resolvedWindow` only as diagnostic metadata; it never uses it to restrict the binder input. The prior Phase 23C implementation was not a completed resolver-to-binder integration.
4. The binder assumes a left-side label region. These primary tables have labels on the right. Fox inline note references need label-region exclusion; Strauss needs the alternative `באור` spelling and its own unit/note row.
5. Sorted-x standalone parentheses are mirrored relative to the current sign check. Ordinary rows and page-specific alignment must validate columns before numeric acceptance.

## Recommended rules for the next phase only

Recognize compact controlled heading blocks, including `תזרימי מזומנים`, and explicitly exclude TOC, auditor, policy and parent-only contexts. Group the neighboring date, year, unit and note rows without pooling pages. Deduplicate overlapping title text layers. Derive year centers from explicit tokens, validate them against ordinary numeric rows, and detect RTL label/note bands independently. Re-detect a continuation page's explicit headers and verify alignment locally rather than requiring unchanged absolute centers. Reconstruct bounded numeric cells including mirrored parentheses and contiguous digit fragments; exclude noncash/acquisition annexes and mixed asset rows. Re-audit the Strauss/Fox regression references before demanding equality. None of these acceptance rules was implemented here.

Production effects: D1 writes 0; full-30 not run; no Capex accepted, recomputed or activated; FCF, Scorecard, FV1/FV2 and lease policy code/data untouched. No expected-value search, OCR or LLM extraction pipeline was used. All raw candidates remain diagnostic; missing accepted fields stay NULL. Existing-five reference scores are Sano 70.0000, Shufersal 81.0000, Rami Levy 58.9231, Yochananof 71.0000 and Neto Malinda 65.0000. They were not modified; live production outputs were not queried or recomputed in this diagnostics-only phase.
