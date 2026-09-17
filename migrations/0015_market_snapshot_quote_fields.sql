-- Compatibility migration for quote fields used by the Globes market adapter.
ALTER TABLE market_snapshots ADD COLUMN previous_close REAL;
ALTER TABLE market_snapshots ADD COLUMN day_change REAL;
ALTER TABLE market_snapshots ADD COLUMN day_change_pct REAL;
