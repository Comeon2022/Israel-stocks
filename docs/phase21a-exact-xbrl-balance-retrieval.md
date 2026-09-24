# Phase 21A — Exact FY2025 XBRL Balance Retrieval

Status: PARTIAL. Exact XBRL attachments were retrieved for all five requested reports, but zero of the 15 target balance fields passed the acceptance gate. No D1 or provenance writes occurred.

## Attachments

| Company | Report | XBRL attachment | Availability |
|---|---:|---|---|
| Castro | 1728277 | `https://mayafiles.tase.co.il/xbrl/1728001-1729000/X1728277.xbrl` | retrieved |
| Isrotel | 1731504 | `https://mayafiles.tase.co.il/xbrl/1731001-1732000/X1731504.xbrl` | retrieved |
| Fox | 1729790 | `https://mayafiles.tase.co.il/xbrl/1729001-1730000/X1729790.xbrl` | retrieved |
| Delta Israel Brands | 1722944 | `https://mayafiles.tase.co.il/xbrl/1722001-1723000/X1722944.xbrl` | retrieved |
| Dan Hotels | 1732438 | `https://mayafiles.tase.co.il/xbrl/1732001-1733000/X1732438.xbrl` | retrieved |

Each attachment came from the exact MAYA report detail and matched the requested report/issuer/security metadata. FY2025 instant contexts were present. The diagnostic inventory found cash-flow concepts such as `CashFlowsFromUsedInOperatingActivities` and `EffectOfExchangeRateChangesOnCashAndCashEquivalents`, but no exact balance cash concept or explicit current/non-current borrowing concept suitable for activation. Cash-flow concepts were rejected as wrong semantic field; broad balance totals were not used as residual debt.

## Field result

Accepted fields: `0/15` — cash `0/5`, short-term debt `0/5`, long-term debt `0/5`. Every target field remains NULL. Rejections are machine-readable in `tmp/phase21a/<companyId>/evidence.json`; the activation plan at `tmp/phase21a/activation-plan.json` contains no fields.

Castro and Isrotel remain P/E + FCF Yield available with EV/EBIT blocked by balance inputs. Fox and Delta retain P/E only; Dan Hotels remains method-blocked. No before/after model change occurred. No broad parser, OCR, historical backfill, lease mixing, residual arithmetic, class change, Scorecard change, FV change, or market change occurred.

Tests/build passed. Worker deployment: NO because only zero-write evidence tooling was added. Browser verification was not performed.
