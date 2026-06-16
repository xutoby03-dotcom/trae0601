const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'plants.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initSQL = `
CREATE TABLE IF NOT EXISTS plants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  location TEXT NOT NULL,
  pot_size INTEGER NOT NULL,
  sun_sensitivity TEXT NOT NULL DEFAULT 'medium',
  group_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  last_watered_at TEXT,
  water_interval_days INTEGER DEFAULT 7,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL,
  email TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS duty_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  weekday INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE(plant_id, weekday)
);

CREATE TABLE IF NOT EXISTS water_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  record_date TEXT NOT NULL,
  soil_moisture TEXT NOT NULL,
  leaf_status TEXT NOT NULL,
  water_amount INTEGER,
  rotated INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  skip_reason TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pest_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plant_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  report_date TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_path TEXT,
  severity TEXT NOT NULL DEFAULT 'low',
  resolved INTEGER DEFAULT 0,
  resolved_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  leave_date TEXT NOT NULL,
  substitute_employee_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (substitute_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_water_records_plant_date ON water_records(plant_id, record_date);
CREATE INDEX IF NOT EXISTS idx_water_records_date ON water_records(record_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedule_weekday ON duty_schedule(weekday);
CREATE INDEX IF NOT EXISTS idx_plants_location ON plants(location);
CREATE INDEX IF NOT EXISTS idx_plants_group ON plants(group_name);
`;

db.exec(initSQL);

const seedData = () => {
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (empCount > 0) return;

  const insertEmp = db.prepare('INSERT INTO employees (name, group_name, email) VALUES (?, ?, ?)');
  const employees = [
    ['张三', '行政组', 'zhangsan@company.com'],
    ['李四', '行政组', 'lisi@company.com'],
    ['王五', '技术组', 'wangwu@company.com'],
    ['赵六', '技术组', 'zhaoliu@company.com'],
    ['钱七', '市场组', 'qianqi@company.com'],
    ['孙八', '市场组', 'sunba@company.com'],
  ];
  employees.forEach(e => insertEmp.run(...e));

  const insertPlant = db.prepare(`
    INSERT INTO plants (name, species, location, pot_size, sun_sensitivity, group_name, status, water_interval_days, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const plants = [
    ['前台绿萝', '绿萝', '前台大厅', 20, 'low', '行政组', 'healthy', 5, '耐阴，怕强光'],
    ['会议室发财树', '发财树', '大会议室', 30, 'medium', '行政组', 'healthy', 10, '浇水不宜过多'],
    ['技术区多肉A', '多肉植物', '技术区A栋', 15, 'high', '技术组', 'healthy', 14, '喜阳光，少浇水'],
    ['技术区龟背竹', '龟背竹', '技术区B栋', 25, 'low', '技术组', 'healthy', 7, '喜湿润环境'],
    ['市场区吊兰', '吊兰', '市场区靠窗', 18, 'medium', '市场组', 'healthy', 5, '定期转盆'],
    ['走廊橡皮树', '橡皮树', '三楼走廊', 22, 'medium', '行政组', 'healthy', 10, '耐旱'],
    ['经理室文竹', '文竹', '经理办公室', 16, 'low', '行政组', 'healthy', 6, '怕干怕晒'],
    ['休息区薄荷', '薄荷', '员工休息区', 14, 'high', '市场组', 'healthy', 3, '需要充足阳光'],
    ['前台多肉组合', '多肉组合', '前台柜台', 12, 'high', '行政组', 'healthy', 14, '小盆栽'],
    ['技术区仙人掌', '仙人掌', '技术区入口', 20, 'high', '技术组', 'healthy', 20, '极耐旱'],
  ];
  plants.forEach(p => insertPlant.run(...p));

  const insertDuty = db.prepare('INSERT INTO duty_schedule (plant_id, employee_id, weekday) VALUES (?, ?, ?)');
  const duties = [
    [1, 1, 1], [1, 2, 3], [1, 1, 5],
    [2, 2, 2], [2, 1, 4],
    [3, 3, 1], [3, 4, 4],
    [4, 4, 2], [4, 3, 5],
    [5, 5, 1], [5, 6, 3], [5, 5, 5],
    [6, 1, 2], [6, 2, 5],
    [7, 2, 1], [7, 1, 3],
    [8, 6, 2], [8, 5, 4],
    [9, 1, 3], [9, 2, 5],
    [10, 3, 2], [10, 4, 5],
  ];
  duties.forEach(d => insertDuty.run(...d));

  const insertHoliday = db.prepare('INSERT INTO holidays (date, name) VALUES (?, ?)');
  const holidays = [
    ['2026-01-01', '元旦'],
    ['2026-02-16', '春节'],
    ['2026-02-17', '春节'],
    ['2026-02-18', '春节'],
    ['2026-04-04', '清明节'],
    ['2026-05-01', '劳动节'],
    ['2026-06-19', '端午节'],
    ['2026-10-01', '国庆节'],
    ['2026-10-02', '国庆节'],
    ['2026-10-03', '国庆节'],
  ];
  holidays.forEach(h => insertHoliday.run(...h));
};

seedData();

console.log('数据库初始化完成:', dbPath);
db.close();
