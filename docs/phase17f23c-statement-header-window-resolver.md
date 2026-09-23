# Phase 17F.23C — Statement Header Window Resolver

Added `worker/src/pdfStatementWindow.ts`, which resolves a controlled consolidated cash-flow title, a bounded adjacent-page window, explicit unit text, and a local header token block before geometry binding. Fragmented year rows are combined structurally; no numeric value or expected Capex amount is used for selection.

The resolver is wired into the focused Phase 17F.23B diagnostic command. The Phase A FY2025 gate remains FAIL: the existing nine-report run still produced no accepted totals because the real PDFs require further statement-window/header reconstruction beyond the current local candidate selection. No Phase B six-report rerun, D1 write, full-30 rerun, FCF, Scorecard, FV1, or FV2 change was made.

The reusable resolver has focused tests for consolidated-title detection, explicit units, fragmented headers, and missing-title rejection. Existing pilot values remain unchanged and were not used as extraction inputs. Diagnostics remain under untracked `tmp/phase17f23b/`.
