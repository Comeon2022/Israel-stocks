CREATE TABLE discovered_reports (id TEXT PRIMARY KEY,company_id TEXT NOT NULL,title TEXT NOT NULL,url TEXT NOT NULL,report_date TEXT,period_end TEXT,discovered_at TEXT NOT NULL,processed_at TEXT,status TEXT NOT NULL,source_type TEXT NOT NULL,fingerprint TEXT,UNIQUE(company_id,url));
CREATE INDEX idx_discovered_company_date ON discovered_reports(company_id,report_date);
