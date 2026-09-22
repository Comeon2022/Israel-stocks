# Phase 17F.5 targeted pilot evidence

## Scope

Targeted evidence was collected only for FY2025 reports 1730561 (Strauss), 1730885 (Victory), 1729790 (Fox), and 1731504 (Isrotel), starting with cash and then controlled searches for Capex, debt, D&A, and lease fields. Temporary raw evidence is written under `tmp/phase17f5/{reportId}/` and is not committed.

## Strauss cash evidence

- Report: 1730561
- HTML attachment: `https://mayafiles.tase.co.il/rhtm/1730001-1731000/H1730561.htm`
- Exact HTML row evidence: `<span ... fieldalias="CashEquivalentsConsolidated">535,266</span>`
- Separate-company comparator in the same HTML: `CashEquivalentsSeparate = 3,297`
- PDF attachment: `https://mayafiles.tase.co.il/rpdf/1730001-1731000/P1730561-00.pdf`
- PDF parser: coordinate-preserving search generated page/y/x evidence and retained raw tokens.
- Accepted value: none.
- Reason: the HTML field alias is a useful row identity, but the targeted representation did not provide a machine-proven current-year column, explicit normalized unit, and consolidated statement scope together. The PDF search had broad cash matches but no conflict-free row reconstruction meeting all gates.

## Other pilot cash evidence

| Company | Report | HTML row candidate | PDF evidence | Accepted |
|---|---:|---|---|---|
| Victory | 1730885 | HTML attachment searched; no HIGH-confidence row | coordinate search generated | No |
| Fox | 1729790 | HTML attachment searched; no HIGH-confidence row | coordinate search generated | No |
| Isrotel | 1731504 | HTML attachment searched; no HIGH-confidence row | coordinate search generated | No |

## Targeted field matrix

| Company | Field | HTML candidate | PDF candidate | Current-year header | Prior-year header | Unit | Scope | HTML/PDF | Confidence | Accepted |
|---|---|---|---|---|---|---|---|---|---|---|
| Strauss | Cash | `CashEquivalentsConsolidated=535,266` | broad matches only | unresolved | unresolved | unresolved | unresolved | not comparable | LOW | No |
| Victory | Cash | candidate search only | broad matches only | unresolved | unresolved | unresolved | unresolved | not comparable | LOW | No |
| Fox | Cash | candidate search only | broad matches only | unresolved | unresolved | unresolved | unresolved | not comparable | LOW | No |
| Isrotel | Cash | candidate search only | broad matches only | unresolved | unresolved | unresolved | unresolved | not comparable | LOW | No |
| All pilots | Capex, ST/LT debt, D&A, lease fields | no accepted row | no accepted row | unresolved | unresolved | unresolved | unresolved | unresolved | LOW/NULL | No |

## Actual PDF coordinate evidence

The parser retained lines in the required form, for example from Strauss page 4:

`page=4 y=177.14 x=328.99:"2025" x=352.87:"31 בדצמבר" x=388.15:"31" ...`

and from the financial-report contents region:

`page=5 y=713.74 ... "דוחות על תזרימי המזומנים"`

These lines prove coordinate extraction and section discovery, but they are not themselves the cash row. Candidate lines remain diagnostic until the actual table row, year column, unit, and scope are reconstructed together.

## Pilot gate

Cash HIGH-confidence count: 0/4. Capex/debt HIGH-confidence count: 0/4. The required gate—cash for at least 3/4 and Capex or debt for at least 2/4—failed. Full 30-report enrichment and D1 numeric persistence are intentionally stopped.

No numeric writes, provenance writes, score changes, FV changes, market changes, or existing-five changes occurred. The strict lease rule remains: principal plus interest is never promoted to explicit total lease cash.
