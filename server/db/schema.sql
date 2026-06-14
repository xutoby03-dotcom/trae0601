-- 原料档案表
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  batch TEXT NOT NULL,
  unopened_shelf_life_days INTEGER NOT NULL,
  opened_days INTEGER NOT NULL,
  storage_temp_min REAL NOT NULL,
  storage_temp_max REAL NOT NULL,
  photo TEXT,
  total_weight REAL NOT NULL,
  unit TEXT NOT NULL,
  low_stock_threshold REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 开封记录表
CREATE TABLE IF NOT EXISTS open_records (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL,
  operator TEXT NOT NULL,
  open_date TEXT NOT NULL,
  remaining_weight REAL NOT NULL,
  sealing_method TEXT NOT NULL,
  freezer_location TEXT NOT NULL,
  actual_temp REAL,
  is_discarded INTEGER NOT NULL DEFAULT 0,
  discard_reason TEXT,
  discard_date TEXT,
  discard_operator TEXT,
  discard_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- 取用记录表
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  open_record_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  amount REAL NOT NULL,
  product_batch TEXT NOT NULL,
  resealed INTEGER NOT NULL DEFAULT 1,
  operator TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (open_record_id) REFERENCES open_records(id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_open_records_ingredient ON open_records(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_open_records_discarded ON open_records(is_discarded);
CREATE INDEX IF NOT EXISTS idx_usage_records_open ON usage_records(open_record_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_ingredient ON usage_records(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_date ON usage_records(usage_date);
