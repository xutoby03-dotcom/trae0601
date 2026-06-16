import { db } from './connection';
import dayjs from 'dayjs';

const chairImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20office%20reclining%20lounge%20chair%20gray%20fabric%20in%20bright%20office%20rest%20area&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comfortable%20office%20nap%20chair%20with%20blanket%20and%20cushion%20minimalist%20design&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ergonomic%20recliner%20chair%20for%20office%20relaxation%20area%20professional%20photo&image_size=square',
];

const chairItems = ['折叠躺椅', '记忆棉靠垫', '法兰绒毯子', '遮光眼罩', '耳塞'];

const locations = [
  '休息区A-01', '休息区A-02', '休息区A-03', '休息区A-04', '休息区A-05',
  '休息区B-01', '休息区B-02', '休息区B-03', '休息区B-04', '休息区B-05',
];

const employeeNames = [
  '张三', '李四', '王五', '赵六', '钱七',
  '孙八', '周九', '吴十', '郑十一', '王十二',
];

const damageParts = [
  '靠背支架', '扶手', '椅面布料', '调节按钮', '脚踏板',
  '头枕', '坐垫弹簧', '万向轮', '折叠铰链', '安全带',
];

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'employee',
      credit_score INTEGER NOT NULL DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chair_number VARCHAR(10) UNIQUE NOT NULL,
      location VARCHAR(100) NOT NULL,
      items TEXT NOT NULL,
      last_cleaned_at DATETIME,
      last_cleaned_by INTEGER REFERENCES users(id),
      photo_urls TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      chair_id INTEGER NOT NULL REFERENCES chairs(id),
      date DATE NOT NULL,
      start_time VARCHAR(5) NOT NULL,
      end_time VARCHAR(5) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      checked_in_at DATETIME,
      ended_at DATETIME,
      cleanup_confirmed BOOLEAN NOT NULL DEFAULT 0,
      damage_reported BOOLEAN NOT NULL DEFAULT 0,
      damage_note TEXT,
      UNIQUE(chair_id, date, start_time)
    );

    CREATE TABLE IF NOT EXISTS damage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chair_id INTEGER NOT NULL REFERENCES chairs(id),
      booking_id INTEGER REFERENCES bookings(id),
      reported_by INTEGER NOT NULL REFERENCES users(id),
      part_name VARCHAR(50) NOT NULL,
      description TEXT,
      reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'reported'
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_chair_date ON bookings(chair_id, date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_damages_chair ON damage_records(chair_id);
    CREATE INDEX IF NOT EXISTS idx_damages_part ON damage_records(part_name);
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertUser = db.prepare(
    'INSERT INTO users (employee_id, name, role, credit_score) VALUES (?, ?, ?, ?)'
  );

  db.prepare('INSERT INTO users (employee_id, name, role, credit_score) VALUES (?, ?, ?, ?)')
    .run('ADMIN001', '系统管理员', 'admin', 100);

  employeeNames.forEach((name, index) => {
    const creditScore = index === 3 ? 55 : index === 7 ? 70 : 100;
    insertUser.run(`E${String(index + 1).padStart(3, '0')}`, name, 'employee', creditScore);
  });

  const insertChair = db.prepare(
    'INSERT INTO chairs (chair_number, location, items, photo_urls, status) VALUES (?, ?, ?, ?, ?)'
  );

  for (let i = 1; i <= 10; i++) {
    const photos = [
      chairImages[i % chairImages.length],
      chairImages[(i + 1) % chairImages.length],
    ];
    insertChair.run(
      `LC-${String(i).padStart(3, '0')}`,
      locations[i - 1],
      JSON.stringify(chairItems),
      JSON.stringify(photos),
      'available'
    );
  }

  const insertBooking = db.prepare(
    'INSERT INTO bookings (user_id, chair_id, date, start_time, end_time, status, checked_in_at, ended_at, cleanup_confirmed, damage_reported) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const insertDamage = db.prepare(
    'INSERT INTO damage_records (chair_id, booking_id, reported_by, part_name, description, status) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const timeSlots = ['12:00', '12:30', '13:00', '13:30', '18:00', '18:30', '19:00', '19:30'];
  const statuses: ('completed' | 'no_show' | 'pending')[] = ['completed', 'completed', 'completed', 'completed', 'no_show', 'pending'];

  let bookingId = 1;

  for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
    const date = dayjs().add(dayOffset, 'day').format('YYYY-MM-DD');
    const isToday = dayOffset === 0;

    for (let i = 0; i < 8; i++) {
      const userId = (i % 10) + 2;
      const chairId = (i % 10) + 1;
      const slotIndex = i % timeSlots.length;
      const statusIndex = isToday && i > 4 ? 5 : i % 6;
      const status = statuses[statusIndex];

      if (isToday && status === 'pending' && i > 5) continue;

      const startTime = timeSlots[slotIndex];
      const endTime = timeSlots[(slotIndex + 1) % timeSlots.length] || '20:00';

      let checkedInAt = null;
      let endedAt = null;
      let cleanupConfirmed = false;
      let damageReported = false;

      if (status === 'completed') {
        checkedInAt = dayjs(date + ' ' + startTime).subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss');
        endedAt = dayjs(date + ' ' + endTime).subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss');
        cleanupConfirmed = true;
        damageReported = i % 7 === 0;
      } else if (status === 'no_show') {
        checkedInAt = null;
        endedAt = null;
      }

      insertBooking.run(
        userId,
        chairId,
        date,
        startTime,
        endTime,
        status,
        checkedInAt,
        endedAt,
        cleanupConfirmed ? 1 : 0,
        damageReported ? 1 : 0
      );

      if (damageReported) {
        const partIndex = (bookingId + i) % damageParts.length;
        insertDamage.run(
          chairId,
          bookingId,
          userId,
          damageParts[partIndex],
          `${damageParts[partIndex]}出现松动和异响，需要维修`,
          bookingId % 5 === 0 ? 'repaired' : 'reported'
        );
      }

      bookingId++;
    }
  }

  const updateNoShowScores = db.prepare(
    'UPDATE users SET credit_score = credit_score - 10 WHERE id IN (SELECT DISTINCT user_id FROM bookings WHERE status = ?)'
  );
  updateNoShowScores.run('no_show');
}
