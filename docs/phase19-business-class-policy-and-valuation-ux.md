# Phase 19 — Business-Class Policy + Valuation UX

Implemented as a policy and presentation update using existing data only. No extraction, financial-data write, market onboarding, lease inference, Scorecard-wide rule change, or FV1 rule change was performed.

The policy approves reusable Apparel Retail and Hotels classes because each has at least two comparable companies, keeps Max Stock unsupported because General Merchandise has only one member, and leaves Diplomat provisional pending explicit runtime metadata. Existing Consumer Branded, Food Retail, and Distribution mappings are preserved.

`/coverage` now shows Business Class and Class Support separately from Financial History, Market Data, Capex, FCF, Adjusted FCF, Balance Inputs, Scorecard V2, FV1, and FV2. Company pages use the existing live API component, which exposes method-level valuation availability and reason codes rather than turning unavailable methods into zeroes. Expanded routes remain API-backed.

No class-dependent backend thresholds or anchors were changed: existing margin stability thresholds and FV2 defaults remain documented in `docs/business-class-policy.md`. Consequently, policy support does not imply model availability; missing balance, market, lease, Capex, FCF, or method inputs remain explicit blockers.

Tests/build and production route verification are required before closeout. Worker deployment is only required if backend class logic is changed; this implementation is frontend/policy documentation only.
