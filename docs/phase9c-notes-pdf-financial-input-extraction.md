# Phase 9C FY2025 notes/PDF financial input extraction

## Baseline

Phase 9B directly inspected the selected FY2025 MAYA XBRL files for Sano `1728715`, Shufersal `1734231`, Rami Levy `1731570`, Yochananof `1732159`, and Neto Malinda `1732821`. The XBRL files contained annual EBIT and CFO but no explicit cash, financial debt, Capex/PPE purchases, D&A, EBITDA, lease liabilities, or lease cash-payment concepts.

Phase 9C will inspect the official MAYA HTML/PDF attachments and notes for those same reports. No values will be inferred from unrelated totals, balance changes, or lease-liability movements. TTM and valuation score /15 remain inactive.

## Official attachment inventory and extraction result

Official MAYA metadata (`GET /api/v1/reports/{reportId}`) resolved HTML, PDF, and XBRL attachments for every selected report: Sano `1728715`, Shufersal `1734231`, Rami Levy `1731570`, Yochananof `1732159`, and Neto Malinda `1732821`. The attachments are the official `mayafiles.tase.co.il` files in each report's numeric range. PDF inspection used deterministic `pypdf` extraction with no OCR, LLM, unofficial mirror, or committed download.

| Company | Auditable FY2025 evidence from official PDF | Decision |
|---|---|---|
| Sano | CFO 270.320 ILSm, page 85; PP&E purchases 191.349 ILSm, page 86; D&A 47.982 ILSm, page 85; current/non-current lease liabilities 15.602/22.638 ILSm, page 82; no bank credit/loans narrative, page 40; lease repayment 15.661 ILSm, page 86 | CFO remains the existing Phase 9B activation. Capex, D&A, cash, debt, and lease cash payments are not activated until exact table/unit confirmation; total investing cash flow is rejected as Capex |
| Shufersal | Cash 1,340 ILSm, pages 124-125; bank debt 13 current + 122 non-current; bonds 380 current + 1,264 non-current, pages 124-125/159; operating profit before other income 982, page 126; D&A 442 PP&E + 458 ROU + 86 intangible, CFO 1,810, PP&E purchases 196, page 130; lease liabilities 461/3,663, pages 124-125; explicit lease cash payment 582, page 155 | Strong evidence, but no activation until normalized migration row/unit checks are implemented |
| Rami Levy | Cash 729.046 ILSm, page 145; lease liabilities 199.937/1,982.697, page 146; D&A 338.378, page 149; lease principal repayment 194.298, page 150 | Capex/CFO and total lease cash payments remain unavailable because the extracted rows are not yet unambiguous |
| Yochananof | Reported EBITDA 551 ILSm and CFO 357 ILSm, pages 17-18; ROU depreciation 124.434 and total lease cash flow paid 173.418, page 138; bank debt 19.348/100.625, page 142; bonds 23.221/121.422, page 143 | Candidate evidence only; exact consolidated statement rows for cash/Capex/lease liabilities are still required before activation |
| Neto Malinda | Official HTML/PDF/XBRL attachments resolved | PDF text layer did not expose auditable target tables; all additional inputs remain NULL |

No new PDF-derived value is activated by this extraction pass. This preserves the validation gate, prevents debt double counting, refuses lease-payment inference, keeps TTM unavailable, and keeps valuation score /15 inactive.
