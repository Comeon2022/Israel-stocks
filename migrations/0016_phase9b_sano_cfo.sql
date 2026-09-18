INSERT OR REPLACE INTO financial_sources (id, company_id, title, source_type, url, publication_date, report_period_end, retrieved_at, notes, created_at)
VALUES ('maya-1728715-xbrl', 'sano', 'FY2025 MAYA XBRL', 'ANNUAL_REPORT', 'https://mayafiles.tase.co.il/xbrl/1728001-1729000/X1728715.xbrl', '2026-03-18', '2025-12-31', datetime('now'), 'Official MAYA FY2025 XBRL; CFO accepted from ifrs-full:CashFlowsFromUsedInOperatingActivities, Current_ForPeriod, ILS thousands.', datetime('now'));

UPDATE financial_statements
SET cash_flow_from_operations = 270.320
WHERE period_id = 'sano-annual-2025';

UPDATE financial_periods
SET source_ids_json = '["sano-annual-2025","maya-1728715-xbrl"]', updated_at = datetime('now')
WHERE id = 'sano-annual-2025';
