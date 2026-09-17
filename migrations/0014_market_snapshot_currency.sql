-- Compatibility migration: 0013 was applied remotely before migration bookkeeping caught up.
ALTER TABLE market_snapshots ADD COLUMN currency TEXT;
