import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building TEXT NOT NULL,
      location TEXT,
      bin_types TEXT NOT NULL,
      open_hours TEXT,
      supervisor TEXT,
      camera_position TEXT,
      description TEXT,
      photos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id INTEGER NOT NULL,
      inspector TEXT NOT NULL,
      inspection_time DATETIME NOT NULL,
      problem_types TEXT NOT NULL,
      photos TEXT,
      notes TEXT,
      is_serious INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (point_id) REFERENCES points(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER,
      point_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'pending',
      assignee TEXT,
      repair_photos TEXT,
      repair_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      assigned_at DATETIME,
      resolved_at DATETIME,
      closed_at DATETIME,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id),
      FOREIGN KEY (point_id) REFERENCES points(id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date DATETIME NOT NULL,
      location TEXT,
      type TEXT,
      participants INTEGER DEFAULT 0,
      related_points TEXT,
      content TEXT,
      photos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_inspections_point_id ON inspections(point_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_time ON inspections(inspection_time);
    CREATE INDEX IF NOT EXISTS idx_tickets_point_id ON tickets(point_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_promotions_date ON promotions(date);
  `);

  const pointColumns = db.prepare("PRAGMA table_info(points)").all() as any[];
  const hasPointPhotos = pointColumns.some((c: any) => c.name === 'photos');
  if (!hasPointPhotos) {
    db.exec('ALTER TABLE points ADD COLUMN photos TEXT');
  }

  const pointCount = db.prepare('SELECT COUNT(*) as count FROM points').get() as { count: number };
  if (pointCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertPoint = db.prepare(`
    INSERT INTO points (building, location, bin_types, open_hours, supervisor, camera_position, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const buildings = [
    { building: '1号楼', location: '单元门左侧', supervisor: '张督导', camera: '1号摄像头' },
    { building: '2号楼', location: '地下车库入口', supervisor: '李督导', camera: '2号摄像头' },
    { building: '3号楼', location: '花园旁', supervisor: '王督导', camera: '3号摄像头' },
    { building: '5号楼', location: '物业服务中心旁', supervisor: '赵督导', camera: '5号摄像头' },
    { building: '6号楼', location: '东门岗亭旁', supervisor: '钱督导', camera: '6号摄像头' },
    { building: '8号楼', location: '健身区旁', supervisor: '孙督导', camera: '8号摄像头' },
    { building: '9号楼', location: '幼儿园旁', supervisor: '周督导', camera: '9号摄像头' },
    { building: '10号楼', location: '西门入口', supervisor: '吴督导', camera: '10号摄像头' },
  ];

  const binTypes = ['厨余垃圾', '其他垃圾', '可回收物', '有害垃圾'];

  const pointIds: number[] = [];
  buildings.forEach((b) => {
    const types = JSON.stringify([binTypes[0], binTypes[1], binTypes[2]]);
    const result = insertPoint.run(
      b.building,
      b.location,
      types,
      '07:00-09:00, 18:00-20:00',
      b.supervisor,
      b.camera,
      `${b.building}垃圾分类投放点`
    );
    pointIds.push(Number(result.lastInsertRowid));
  });

  const insertInspection = db.prepare(`
    INSERT INTO inspections (point_id, inspector, inspection_time, problem_types, photos, notes, is_serious)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const problemTypes = ['混投', '满溢', '破袋', '厨余未沥水', '可回收堆放'];
  const inspectors = ['张督导', '李督导', '王督导', '赵督导', '钱督导'];

  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const pointId = pointIds[Math.floor(Math.random() * pointIds.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 12) + 6;
    const inspectTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

    const numProblems = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...problemTypes].sort(() => Math.random() - 0.5);
    const selectedProblems = shuffled.slice(0, numProblems);

    const isSerious = selectedProblems.includes('满溢') || selectedProblems.length >= 2 ? 1 : 0;

    insertInspection.run(
      pointId,
      inspectors[Math.floor(Math.random() * inspectors.length)],
      inspectTime.toISOString(),
      JSON.stringify(selectedProblems),
      JSON.stringify([]),
      `日常巡查记录 ${i + 1}`,
      isSerious
    );
  }

  const insertTicket = db.prepare(`
    INSERT INTO tickets (inspection_id, point_id, title, description, priority, status, assignee, created_at, assigned_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seriousInspections = db.prepare('SELECT * FROM inspections WHERE is_serious = 1 ORDER BY inspection_time DESC LIMIT 10').all() as any[];

  const propertyStaff = ['物业王师傅', '物业李师傅', '物业张师傅', '物业陈师傅'];
  const statuses = ['pending', 'processing', 'resolved', 'closed'];

  seriousInspections.forEach((inspection, idx) => {
    const status = statuses[Math.min(idx, 3)];
    const problemList = JSON.parse(inspection.problem_types).join('、');
    const point = db.prepare('SELECT building FROM points WHERE id = ?').get(inspection.point_id) as any;

    let assignedAt = null;
    let resolvedAt = null;

    if (status !== 'pending') {
      assignedAt = new Date(new Date(inspection.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString();
    }
    if (status === 'resolved' || status === 'closed') {
      resolvedAt = new Date(new Date(assignedAt!).getTime() + (Math.floor(Math.random() * 24) + 4) * 60 * 60 * 1000).toISOString();
    }

    insertTicket.run(
      inspection.id,
      inspection.point_id,
      `${point.building}存在${problemList}问题`,
      `巡查发现${point.building}投放点存在${problemList}问题，请及时整改。`,
      idx < 3 ? 'high' : 'medium',
      status,
      status !== 'pending' ? propertyStaff[Math.floor(Math.random() * propertyStaff.length)] : null,
      inspection.created_at,
      assignedAt,
      resolvedAt
    );
  });

  const insertPromotion = db.prepare(`
    INSERT INTO promotions (title, date, location, type, participants, related_points, content, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const promotionTypes = ['上门宣传', '社区讲座', '海报宣传', '现场指导', '短视频宣传'];
  const promotionTitles = [
    '垃圾分类知识普及活动',
    '厨余垃圾正确投放指导',
    '可回收物分类宣传周',
    '有害垃圾专项宣传',
    '垃圾分类优秀楼栋表彰',
    '暑期垃圾分类亲子活动',
  ];

  for (let i = 0; i < 8; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const promoDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const relatedPointIds = pointIds.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 1);

    insertPromotion.run(
      promotionTitles[i % promotionTitles.length],
      promoDate.toISOString(),
      '社区广场',
      promotionTypes[Math.floor(Math.random() * promotionTypes.length)],
      Math.floor(Math.random() * 50) + 10,
      JSON.stringify(relatedPointIds),
      '本次宣传活动向居民普及了垃圾分类的重要性和正确方法，提高了居民的环保意识。',
      JSON.stringify([])
    );
  }

  console.log('数据库初始化完成，已插入示例数据');
}

export default initDatabase;
