# Phase 17F.27A — FY2025 Balance Evidence Extraction

Status: complete, zero-write. The exact ten FY2025 reports were audited from the cached official PDF/XBRL extraction set. Cloudflare/D1 was not required and was not used for this phase.

Reports audited: Strauss `1730561`, Victory `1730885`, Tiv Taam `1730597`, Fox `1729790`, Max Stock `1727874`, Delta Israel Brands `1722944`, Castro `1728277`, Diplomat `1731729`, Isrotel `1731504`, and Dan Hotels `1732438`.

Cash means cash and cash equivalents only. Debt means explicit current/non-current non-lease interest-bearing borrowings. No residual arithmetic, magnitude inference, comparative substitution, broad financial-liability mapping, or lease mixing was allowed.

All 30 target fields are `REJECTED_AMBIGUOUS` with `LOW` confidence and null values. Cached fragments are retained under `tmp/phase17f27a/<companyId>/evidence.json`; none supplied complete independently verified field proof satisfying the gate. Lease liabilities remain diagnostic-only and were excluded from both debt fields. Castro and Isrotel are not `BALANCE_EVIDENCE_READY`. No candidate activation set was produced.

No writes were made to D1, financial tables, provenance, market snapshots, score/FV state, or Worker deployment. No production SQL was generated. Recommended 17F.27B scope is a fresh exact XBRL/PDF proof pass before any activation.
