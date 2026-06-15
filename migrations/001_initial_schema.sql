CREATE TABLE elevators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  unit TEXT NOT NULL,
  max_load INTEGER NOT NULL,
  allows_protection_mat INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  building TEXT NOT NULL,
  unit TEXT NOT NULL,
  floor INTEGER NOT NULL,
  moving_company TEXT NOT NULL,
  vehicle_info TEXT NOT NULL,
  estimated_items INTEGER NOT NULL,
  estimated_weight INTEGER NOT NULL,
  needs_protection_mat INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  elevator_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id)
);

CREATE TABLE maintenance (
  id TEXT PRIMARY KEY,
  elevator_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id)
);

CREATE TABLE completion_records (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  protection_mat_returned INTEGER NOT NULL DEFAULT 0,
  wall_damage TEXT NOT NULL DEFAULT 'none',
  wall_damage_description TEXT,
  deposit_status TEXT NOT NULL DEFAULT 'collected',
  deposit_amount REAL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  needs_inspection INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  floor INTEGER NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_elevator_date ON reservations(elevator_id, date);
CREATE INDEX idx_inspections_status ON inspections(status);

INSERT INTO elevators (id, name, building, unit, max_load, allows_protection_mat, status) VALUES
('elev-001', '1栋A单元货梯', '1栋', 'A单元', 1000, 1, 'active'),
('elev-002', '1栋B单元货梯', '1栋', 'B单元', 1000, 1, 'active'),
('elev-003', '2栋A单元货梯', '2栋', 'A单元', 1200, 1, 'active'),
('elev-004', '2栋B单元货梯', '2栋', 'B单元', 1200, 0, 'active'),
('elev-005', '3栋货梯', '3栋', '综合', 1500, 1, 'maintenance');

INSERT INTO maintenance (id, elevator_id, date, start_time, end_time, description) VALUES
('maint-001', 'elev-005', '2026-06-20', '09:00', '12:00', '年度检修'),
('maint-002', 'elev-001', '2026-06-25', '14:00', '16:00', '例行保养');
