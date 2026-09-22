# Phase 17F.6 — PDF table geometry pilot

Status: **pilot gate failed; no financial values were activated and no D1 writes were made**.

The new `maya:geometry` diagnostic uses official MAYA PDFs, preserves text coordinates, clusters lines with font-height-aware tolerance, detects repeated numeric x positions, binds explicit years, and rejects ambiguous assignments. Temporary artifacts are written under `tmp/phase17f6/{reportId}/`.

## Strauss cash

HTML evidence for report `1730561` identifies `CashEquivalentsConsolidated=535,266` in thousands of ILS. The strongest PDF candidate was page 289:

```text
page=289
unit evidence: "מיליוני ש\"ח"
header y=653.50: x=121.22 "2025", x=208.61 "2024" (repeated entity blocks)
cash row y=597.58: x=91.94 "800", x=154.82 "1,126", x=230.69 "507", x=303.53 "574"
label x=402.19 "מזומנים ושווי מזומנים"
```

This is a multi-entity detail table. Its values do not match the consolidated HTML value 535.266 million, so scope and HTML/PDF reconciliation fail. Page 213 also contains `x=360.67 "535"` at `y=527.83`, but only inside narrative summary text without complete year-column binding. Strauss: **LOW, rejected**. FY2024 comparison against report `1653980` was not accepted because the FY2025 row itself failed the gates.

## Victory cash

Report `1730885` produced page 53 narrative evidence (`y=630.10`, label `יתרות מזומנים ושווי מזומנים`, value `19.1`) and page 99 candidate row `מזומנים ושווי מזומנים` with 2024 `80,975` and 2025 `26,620`, unit evidence thousands of ILS. The primary consolidated statement heading and HTML/PDF match were not proven. Victory: **LOW, rejected**.

## Fox cash

Report `1729790` produced page 137 candidate `מזומנים ושווי מזומנים`, 2025 `104,464`, with thousands-of-ILS evidence. Page 176 contains `y=680.86`, `x=73.46 "38,376"`, label `x=384.19 "מזומנים ושווי מזומנים"`, also with thousands-of-ILS evidence. These are incomplete/detail candidates without a validated consolidated 2025/2024 binding. Fox: **LOW, rejected**.

## Isrotel cash

Report `1731504` produced page 75:

```text
header y=695.86: x≈121.83 "2023", x≈185.67 "2024", x≈245.94 "2025"
cash row y=635.50: x=122.30 "92,175", x=183.26 "115,478", label "א' מזומנים ושווי מזומנים"
extra note token x=248.57 "5"
unit evidence: thousands of ILS
```

The two values are geometrically plausible, but the note token is correctly marked ambiguous and scope is UNKNOWN. No HTML/PDF or FY2024 match was proven. Isrotel: **LOW, rejected**.

## Other fields and gate

Capex, debt, D&A, and Victory/Fox lease candidates were found but no candidate simultaneously proved section, consolidated scope, explicit years, and unit. No explicit total lease-cash row was accepted; principal plus interest remains prohibited.

Generic profiles now retain report ID, page, section, scope, unit, header coordinates, numeric clusters, row y coordinates, and raw tokens. No issuer/year profile generalized sufficiently for activation.

Cash HIGH: **0/4**, required >=3/4. Capex or debt HIGH: **0/4**, required >=2/4. The pilot gate fails. Full 30-report processing, D1 writes, FCF enrichment, adjusted FCF, and scorecard rerun remain stopped. The blocker is deterministic table-region selection: distinguishing the primary consolidated statement from narrative, subsidiary, and note tables while proving scope and comparative reconciliation.
