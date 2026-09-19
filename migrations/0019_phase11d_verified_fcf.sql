-- Phase 11D: manually verified official MAYA consolidated cash-flow inputs.
-- Units are ILS millions. FCF is derived by the existing Fair Value engine.
INSERT OR REPLACE INTO financial_sources (id,company_id,title,source_type,url,publication_date,report_period_end,retrieved_at,notes,created_at) VALUES
('maya-1652473-pdf-fcf','sano','Official MAYA Sano FY2024 consolidated cash-flow statement','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1652001-1653000/P1652473-00.pdf','2025-03-27','2024-12-31',datetime('now'),'Verified consolidated cash-flow statement: FY2024 CFO 248.921 and FY2023 comparative CFO 270.245; explicit PP&E purchases FY2024 147.433 and FY2023 comparative 91.822. ILS thousands normalized to ILS millions.','2026-09-19'),
('maya-1728715-pdf-fcf','sano','Official MAYA Sano FY2025 consolidated cash-flow statement','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1728001-1729000/P1728715-00.pdf','2026-03-18','2025-12-31',datetime('now'),'Verified consolidated cash-flow statement: FY2025 CFO 270.320 and explicit PP&E purchases 191.349. ILS thousands normalized to ILS millions.','2026-09-19'),
('maya-1732821-pdf-fcf','neto-malinda','Official MAYA Neto FY2025 consolidated cash-flow statement','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1732001-1733000/P1732821-00.pdf','2026-03-31','2025-12-31',datetime('now'),'Verified consolidated comparative cash-flow statement: FY2023 CFO 213.015, Capex 67.032; FY2024 CFO 324.262, Capex 41.488; FY2025 CFO is negative (60.655), Capex 42.089. ILS thousands normalized to ILS millions; parentheses preserved as negative.','2026-09-19'),
('maya-1734231-pdf-fcf','shufersal','Official MAYA Shufersal FY2025 consolidated cash-flow and lease disclosures','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1734001-1735000/P1734231-00.pdf','2026-04-10','2025-12-31',datetime('now'),'Verified consolidated cash flow: CFO/Capex FY2025 1810/196, FY2024 comparative 2238/265, FY2023 comparative 1949/528. Lease note explicitly reports total cash flow paid for leases FY2024 583 and FY2025 582. FY2023 lease total from P1582311. ILS millions.','2026-09-19'),
('maya-1582311-pdf-lease','shufersal','Official MAYA Shufersal FY2023 lease disclosure','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1582001-1583000/P1582311-00.pdf','2024-03-28','2023-12-31',datetime('now'),'Verified consolidated lease note explicitly reports total cash flow paid for leases FY2023 568. ILS millions.','2026-09-19'),
('maya-1732159-pdf-fcf','yochananof','Official MAYA Yochananof FY2025 consolidated cash-flow and lease disclosures','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1732001-1733000/P1732159-00.pdf','2026-03-30','2025-12-31',datetime('now'),'Verified consolidated comparative Capex FY2023 177.901, FY2024 135.701, FY2025 152.373; existing CFO values retained. Lease notes explicitly report total cash paid for leases FY2023 152.750, FY2024 163.624, FY2025 173.418. ILS thousands normalized to ILS millions.','2026-09-19'),
('maya-1731570-pdf-capex','rami-levy','Official MAYA Rami Levy FY2025 consolidated cash-flow statement','ANNUAL_REPORT','https://mayafiles.tase.co.il/rpdf/1731001-1732000/P1731570-00.pdf','2026-03-26','2025-12-31',datetime('now'),'Verified consolidated comparative Capex FY2023 126.280, FY2024 164.374, FY2025 219.604. Lease principal is not treated as total lease cash payment. ILS thousands normalized to ILS millions.','2026-09-19');

UPDATE financial_statements SET cash_flow_from_operations=270.245,capex=91.822 WHERE period_id='sano-annual-2023';
UPDATE financial_statements SET cash_flow_from_operations=248.921,capex=147.433 WHERE period_id='sano-annual-2024';
UPDATE financial_statements SET cash_flow_from_operations=270.320,capex=191.349 WHERE period_id='sano-annual-2025';
UPDATE financial_statements SET cash_flow_from_operations=213.015,capex=67.032 WHERE period_id='neto-malinda-maya-1583630';
UPDATE financial_statements SET cash_flow_from_operations=324.262,capex=41.488 WHERE period_id='neto-malinda-maya-1654861';
UPDATE financial_statements SET cash_flow_from_operations=-60.655,capex=42.089 WHERE period_id='neto-malinda-maya-1732821';
UPDATE financial_statements SET cash_flow_from_operations=1949,capex=528,total_lease_cash_payments=568 WHERE period_id='shufersal-maya-1582311';
UPDATE financial_statements SET cash_flow_from_operations=2238,capex=265,total_lease_cash_payments=583 WHERE period_id='shufersal-maya-1653761';
UPDATE financial_statements SET cash_flow_from_operations=1810,capex=196,total_lease_cash_payments=582 WHERE period_id='shufersal-maya-1734231';
UPDATE financial_statements SET cash_flow_from_operations=539.701,capex=126.280 WHERE period_id='rami-levy-maya-1584746';
UPDATE financial_statements SET cash_flow_from_operations=606.146,capex=164.374 WHERE period_id='rami-levy-maya-1654478';
UPDATE financial_statements SET cash_flow_from_operations=618.342,capex=219.604 WHERE period_id='rami-levy-maya-1731570';
UPDATE financial_statements SET cash_flow_from_operations=358.803,capex=177.901,total_lease_cash_payments=152.750 WHERE period_id='yochananof-maya-1587708';
UPDATE financial_statements SET cash_flow_from_operations=433.017,capex=135.701,total_lease_cash_payments=163.624 WHERE period_id='yochananof-maya-1654778';
UPDATE financial_statements SET cash_flow_from_operations=357.312,capex=152.373,total_lease_cash_payments=173.418 WHERE period_id='yochananof-maya-1732159';

UPDATE financial_periods SET source_ids_json='["sano-annual-2023","maya-1652473-pdf-fcf"]',updated_at=datetime('now') WHERE id='sano-annual-2023';
UPDATE financial_periods SET source_ids_json='["sano-annual-2024","maya-1652473-pdf-fcf"]',updated_at=datetime('now') WHERE id='sano-annual-2024';
UPDATE financial_periods SET source_ids_json='["sano-annual-2025","maya-1728715-xbrl","maya-1728715-pdf-fy2025","maya-1728715-pdf-fcf"]',updated_at=datetime('now') WHERE id='sano-annual-2025';
UPDATE financial_periods SET source_ids_json='["neto-malinda-maya-1583630","maya-1732821-pdf-fcf"]',updated_at=datetime('now') WHERE id='neto-malinda-maya-1583630';
UPDATE financial_periods SET source_ids_json='["neto-malinda-maya-1654861","maya-1732821-pdf-fcf"]',updated_at=datetime('now') WHERE id='neto-malinda-maya-1654861';
UPDATE financial_periods SET source_ids_json='["neto-malinda-maya-1732821","maya-1732821-pdf-fy2025","maya-1732821-pdf-fcf"]',updated_at=datetime('now') WHERE id='neto-malinda-maya-1732821';
UPDATE financial_periods SET source_ids_json='["shufersal-maya-1582311","maya-1582311-pdf-lease"]',updated_at=datetime('now') WHERE id='shufersal-maya-1582311';
UPDATE financial_periods SET source_ids_json='["shufersal-maya-1653761","maya-1734231-pdf-fcf"]',updated_at=datetime('now') WHERE id='shufersal-maya-1653761';
UPDATE financial_periods SET source_ids_json='["shufersal-maya-1734231","maya-1734231-pdf-fy2025","maya-1734231-pdf-fcf"]',updated_at=datetime('now') WHERE id='shufersal-maya-1734231';
UPDATE financial_periods SET source_ids_json='["rami-levy-maya-1584746","maya-1731570-pdf-capex"]',updated_at=datetime('now') WHERE id='rami-levy-maya-1584746';
UPDATE financial_periods SET source_ids_json='["rami-levy-maya-1654478","maya-1731570-pdf-capex"]',updated_at=datetime('now') WHERE id='rami-levy-maya-1654478';
UPDATE financial_periods SET source_ids_json='["rami-levy-maya-1731570","maya-1731570-pdf-fy2025","maya-1731570-pdf-capex"]',updated_at=datetime('now') WHERE id='rami-levy-maya-1731570';
UPDATE financial_periods SET source_ids_json='["yochananof-maya-1587708","maya-1732159-pdf-fcf"]',updated_at=datetime('now') WHERE id='yochananof-maya-1587708';
UPDATE financial_periods SET source_ids_json='["yochananof-maya-1654778","maya-1732159-pdf-fcf"]',updated_at=datetime('now') WHERE id='yochananof-maya-1654778';
UPDATE financial_periods SET source_ids_json='["yochananof-maya-1732159","maya-1732159-pdf-fy2025","maya-1732159-pdf-fcf"]',updated_at=datetime('now') WHERE id='yochananof-maya-1732159';
