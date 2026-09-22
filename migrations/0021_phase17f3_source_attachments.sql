CREATE TABLE IF NOT EXISTS financial_source_attachments (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  attachment_type TEXT NOT NULL,
  url TEXT NOT NULL,
  content_type TEXT,
  title TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(source_id, attachment_type)
);
CREATE INDEX IF NOT EXISTS idx_financial_source_attachments_source ON financial_source_attachments(source_id);
