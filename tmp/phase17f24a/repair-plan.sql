-- Phase 17F.24A — generated audit-only repair plan.
-- NOT EXECUTED. Every assignment is field-specific, source-proven, and guarded
-- by the current NULL state. Do not replace whole financial_statements rows.
-- Source evidence: official MAYA PDFs cached under tmp/phase17f24a/<reportId>/.

BEGIN;

-- Capex / PPE purchases, explicit cash-flow rows (NIS millions).
UPDATE financial_statements SET capex=126.280 WHERE period_id='rami-levy-maya-1584746' AND capex IS NULL;
UPDATE financial_statements SET capex=164.374 WHERE period_id='rami-levy-maya-1654478' AND capex IS NULL;
UPDATE financial_statements SET capex=219.604 WHERE period_id='rami-levy-maya-1686628' AND capex IS NULL;
UPDATE financial_statements SET capex=177.901 WHERE period_id='yochananof-maya-1587708' AND capex IS NULL;
UPDATE financial_statements SET capex=135.701 WHERE period_id='yochananof-maya-1654778' AND capex IS NULL;
UPDATE financial_statements SET capex=152.373 WHERE period_id='yochananof-maya-1687009' AND capex IS NULL;
UPDATE financial_statements SET capex=528.000 WHERE period_id='shufersal-maya-1582311' AND capex IS NULL;
UPDATE financial_statements SET capex=265.000 WHERE period_id='shufersal-maya-1653761' AND capex IS NULL;
UPDATE financial_statements SET capex=196.000 WHERE period_id='shufersal-maya-1688899' AND capex IS NULL;
UPDATE financial_statements SET capex=67.032 WHERE period_id='neto-malinda-maya-1583630' AND capex IS NULL;
UPDATE financial_statements SET capex=41.488 WHERE period_id='neto-malinda-maya-1654861' AND capex IS NULL;
UPDATE financial_statements SET capex=42.089 WHERE period_id='neto-malinda-maya-1687465' AND capex IS NULL;

-- Shufersal explicit total cash paid for leases.
UPDATE financial_statements SET total_lease_cash_payments=568.000 WHERE period_id='shufersal-maya-1582311' AND total_lease_cash_payments IS NULL;
UPDATE financial_statements SET total_lease_cash_payments=583.000 WHERE period_id='shufersal-maya-1653761' AND total_lease_cash_payments IS NULL;
UPDATE financial_statements SET total_lease_cash_payments=582.000 WHERE period_id='shufersal-maya-1688899' AND total_lease_cash_payments IS NULL;

-- Yochananof explicit total cash paid for leases.
UPDATE financial_statements SET total_lease_cash_payments=152.750 WHERE period_id='yochananof-maya-1587708' AND total_lease_cash_payments IS NULL;
UPDATE financial_statements SET total_lease_cash_payments=163.624 WHERE period_id='yochananof-maya-1654778' AND total_lease_cash_payments IS NULL;
UPDATE financial_statements SET total_lease_cash_payments=173.418 WHERE period_id='yochananof-maya-1687009' AND total_lease_cash_payments IS NULL;

COMMIT;
