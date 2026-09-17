ALTER TABLE companies ADD COLUMN ingestion_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE companies ADD COLUMN discovery_provider TEXT;
ALTER TABLE companies ADD COLUMN mapping_profile TEXT;
ALTER TABLE companies ADD COLUMN ingestion_readiness TEXT NOT NULL DEFAULT 'DISCOVERY_ONLY';
UPDATE companies SET maya_company_id=777,discovery_provider='MAYA',mapping_profile='ifrs-full-default',ingestion_readiness='DISCOVERY_ONLY' WHERE id='shufersal';
UPDATE companies SET maya_company_id=1445,discovery_provider='MAYA',mapping_profile='ifrs-full-default',ingestion_readiness='DISCOVERY_ONLY' WHERE id='rami-levy';
UPDATE companies SET maya_company_id=1786,discovery_provider='MAYA',mapping_profile='ifrs-full-default',ingestion_readiness='DISCOVERY_ONLY' WHERE id='yochananof';
UPDATE companies SET maya_company_id=1463,discovery_provider='MAYA',mapping_profile='ifrs-full-default',ingestion_readiness='DISCOVERY_ONLY' WHERE id='neto-malinda';
UPDATE companies SET ingestion_enabled=1,discovery_provider='MAYA',mapping_profile='ifrs-full-default',ingestion_readiness='AUTO_INGEST' WHERE id='sano';
