UPDATE companies SET ingestion_enabled=1,ingestion_readiness='AUTO_INGEST',updated_at=datetime('now') WHERE id IN ('sano','shufersal','rami-levy','yochananof','neto-malinda');
