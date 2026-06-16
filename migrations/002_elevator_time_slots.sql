CREATE TABLE elevator_time_slots (
  id TEXT PRIMARY KEY,
  elevator_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day_of_week INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (elevator_id) REFERENCES elevators(id) ON DELETE CASCADE
);

CREATE INDEX idx_elevator_time_slots_elevator ON elevator_time_slots(elevator_id);

INSERT INTO elevator_time_slots (id, elevator_id, start_time, end_time) VALUES
('ets-001', 'elev-001', '08:00', '10:00'),
('ets-002', 'elev-001', '10:00', '12:00'),
('ets-003', 'elev-001', '13:00', '15:00'),
('ets-004', 'elev-001', '15:00', '17:00'),
('ets-005', 'elev-001', '17:00', '19:00'),
('ets-006', 'elev-002', '08:00', '10:00'),
('ets-007', 'elev-002', '10:00', '12:00'),
('ets-008', 'elev-002', '13:00', '15:00'),
('ets-009', 'elev-002', '15:00', '17:00'),
('ets-010', 'elev-003', '08:00', '10:00'),
('ets-011', 'elev-003', '10:00', '12:00'),
('ets-012', 'elev-003', '13:00', '15:00'),
('ets-013', 'elev-003', '15:00', '17:00'),
('ets-014', 'elev-003', '17:00', '19:00'),
('ets-015', 'elev-004', '09:00', '11:00'),
('ets-016', 'elev-004', '14:00', '16:00'),
('ets-017', 'elev-005', '08:00', '12:00'),
('ets-018', 'elev-005', '13:00', '17:00');
