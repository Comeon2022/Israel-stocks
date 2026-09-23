# Phase 17F.20 — Direct FY2024 PDF Page Resolution

Fixed official MAYA PDFs only: Victory report `1653470` and Fox report `1654283`. Physical pages were resolved from the local financial-statement sequence and exact consolidated statement title; no guessed URL, HTML alias, cash-flow row, note, or balance-delta inference was used.

| Issuer | FY2024 PDF statement page | Unit | FY2024 pure Cash | FY2025 comparative pure Cash | Result |
|---|---:|---|---:|---:|---|
| Victory | 98–99 (printed 8–9) | thousand ILS | 104,060 = 104.060 ILSm | 104,060 = 104.060 ILSm | HIGH |
| Fox | 126–127 (printed 125–126) | thousand ILS | 1,055,842 = 1,055.842 ILSm | 1,055,842 = 1,055.842 ILSm | HIGH |

Both rows are the exact consolidated balance-sheet line `מזומנים ושווי מזומנים`, dated 31.12.2024. Victory’s statement title is on physical pages 98–99; Fox’s TOC points to printed pages 125–126, and the statement title appears on physical pages 126–127. The FY2025 comparative was checked against the corresponding authoritative balance-sheet page in reports `1730885` and `1729790`, not against HTML aliases.

The Cash gate is now `4/4 HIGH`. No Capex/debt pilot was run in this implementation because the phase’s direct-page resolver and evidence closeout are complete; D1 remains unchanged at zero. Diagnostic artifacts are under `tmp/phase17f20/` and are intentionally untracked.
