# Phase 17F.12 targeted FY2024 comparative extraction

Only reports `1653980` and `1653647` were processed using targeted local table geometry.

## Strauss — report 1653980

- Page: `289`
- Title: consolidated statement of financial position (`דוחות על המצב הכספי מאוחדים`)
- Scope: consolidated
- Unit: millions of ILS (`מיליוני ש"ח`)
- FY2024 x coordinate: approximately `151.70`
- Cash row: `מזומנים ושווי מזומנים`
- FY2024 current-year Cash: raw `1,142`; normalized `1,142.000 ILSm`
- FY2025-report comparative: `1,142` million ILS from report `1730561`
- Status: `EXACT_MATCH`
- Final confidence: `HIGH`

## Isrotel — report 1653647

- Page: `72`
- Title: consolidated statement of financial position (`דוחות מאוחדים על המצב הכספי`)
- Scope: consolidated
- Unit: thousands of ILS
- FY2024 x coordinate: approximately `189.29`
- Note column x coordinate: approximately `247.97`; token `5` is a note number
- Cash row: `מזומנים ושווי מזומנים`
- FY2024 current-year Cash: raw `92,175`; normalized `92.175 ILSm`
- FY2025-report comparative: `92,175` thousand ILS from report `1731504`
- Status: `EXACT_MATCH`
- Final confidence: `HIGH`

## Gate

Strauss and Isrotel both reached HIGH (`2/2`). Victory/Fox were not processed in this task. Cash HIGH is `2/4`, below the full pilot threshold of `3/4`; D1 writes were zero. Null handling and the strict explicit-total lease policy remain unchanged.
