# Business-Class Policy

This policy is deterministic and separate from data availability or investment attractiveness. It does not create financial inputs and does not activate a Scorecard or valuation method when required inputs are missing.

## Supported policy classes

- Consumer Branded: branded consumer products with product-margin economics. Existing: Sano, Strauss.
- Food Retail: grocery/food-store retail economics. Existing: Shufersal, Rami Levy, Yochananof, Victory, Tiv Taam.
- Distribution: wholesale/import distribution economics. Existing: Neto Malinda. Diplomat remains provisional because current metadata does not prove the approved runtime mapping.
- Apparel Retail: comparable apparel/lifestyle retail economics. Policy-approved for Fox, Delta Israel Brands, and Castro; no issuer-specific exception.
- Hotels: comparable hotel operating economics. Policy-approved for Isrotel and Dan Hotels; no issuer-specific exception.

General Merchandise is rejected: Max Stock is currently the only legitimate member, so the two-company gate is not met.

## Threshold and anchor policy

The existing generic margin-stability ladder remains unchanged: spread `<= 2%` is stable, `>2% and <=5%` moderate, and `>5%` volatile. No new issuer-specific margin ladder, Scorecard threshold, or FV2 anchor was added in this phase. Existing FV2 anchors remain the model defaults (EV/EBIT 12, P/E 15, FCF yield 5.5); FCF-yield logic is unchanged. Apparel and Hotels are policy classes, not a license to bypass existing evidence and coverage gates.

## Decisions

| Company | Current | Proposed | Decision | Scorecard | FV2 |
|---|---|---|---|---|---|
| Strauss | consumer branded | Consumer Branded | SUPPORTED_EXISTING | policy-supported; inputs may block | inputs may block |
| Victory | food retail | Food Retail | SUPPORTED_EXISTING | policy-supported; lease/input blockers remain | inputs may block |
| Tiv Taam | food retail | Food Retail | SUPPORTED_EXISTING | policy-supported; lease/input blockers remain | inputs may block |
| Fox | unsupported | Apparel Retail | SUPPORTED_NEW_CLASS | no data assumptions added | no data assumptions added |
| Max Stock | unsupported | General Merchandise | UNSUPPORTED | one-company class rejected | unavailable |
| Delta Israel Brands | unsupported | Apparel Retail | SUPPORTED_NEW_CLASS | no data assumptions added | no data assumptions added |
| Castro | unsupported | Apparel Retail | SUPPORTED_NEW_CLASS | no data assumptions added | no data assumptions added |
| Diplomat | distribution? | Distribution | PROVISIONAL | metadata fit unresolved | unavailable until approved |
| Isrotel | unsupported | Hotels | SUPPORTED_NEW_CLASS | no data assumptions added | no data assumptions added |
| Dan Hotels | unsupported | Hotels | SUPPORTED_NEW_CLASS | no data assumptions added | no data assumptions added |

No one-company class, company-specific exception, current-price anchor, or recommendation is permitted.
