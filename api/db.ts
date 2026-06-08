import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'data.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_participants INTEGER NOT NULL,
    cost REAL DEFAULT 0,
    bring_items TEXT DEFAULT '',
    poster TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'not_started',
    type TEXT DEFAULT '其他',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    note TEXT DEFAULT '',
    bring_friends INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'confirmed',
    checked_in INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
  );
`)

const countActivities = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }

if (countActivities.count === 0) {
  const now = new Date().toISOString()

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, title, location, start_time, end_time, max_participants, cost, bring_items, poster, status, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertRegistration = db.prepare(`
    INSERT INTO registrations (id, activity_id, name, contact, note, bring_friends, status, checked_in, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const seed = db.transaction(() => {
    insertActivity.run('act-1', '周末登山活动', '白云山南门', '2026-06-15T08:00:00', '2026-06-15T17:00:00', 20, 30, '运动鞋、水壶、防晒霜', '', 'registering', '户外', now)
    insertActivity.run('act-2', 'Python编程工作坊', '图书馆301室', '2026-06-20T14:00:00', '2026-06-20T17:00:00', 15, 0, '笔记本电脑', '', 'registering', '技术', now)
    insertActivity.run('act-3', '社团结业晚会', '大礼堂', '2026-07-01T19:00:00', '2026-07-01T22:00:00', 100, 0, '', '', 'not_started', '社交', now)
    insertActivity.run('act-4', '春季摄影比赛', '校园全域', '2026-05-01T09:00:00', '2026-05-31T23:59:00', 30, 0, '相机或手机', '', 'ended', '艺术', now)
    insertActivity.run('act-5', '篮球友谊赛', '体育馆B区', '2026-06-10T15:00:00', '2026-06-10T18:00:00', 10, 0, '运动服', '', 'full', '体育', now)
    insertActivity.run('act-6', '读书分享会', '咖啡书屋', '2026-06-18T19:00:00', '2026-06-18T21:00:00', 8, 0, '推荐书目', '', 'registering', '文化', now)

    insertRegistration.run(crypto.randomUUID(), 'act-1', '张三', '13800001111', '第一次参加', 1, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-1', '李四', '13800002222', '', 0, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-1', '王五', '13800003333', '有登山经验', 2, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-1', '赵六', '13800004444', '', 0, 'waitlisted', 0, now)

    insertRegistration.run(crypto.randomUUID(), 'act-2', '陈七', '13800005555', 'Python初学者', 0, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-2', '孙八', '13800006666', '', 1, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-2', '周九', '13800007777', '希望学数据分析', 0, 'confirmed', 0, now)

    insertRegistration.run(crypto.randomUUID(), 'act-4', '吴十', '13800008888', '', 0, 'confirmed', 1, now)
    insertRegistration.run(crypto.randomUUID(), 'act-4', '郑十一', '13800009999', '手机摄影', 0, 'confirmed', 1, now)
    insertRegistration.run(crypto.randomUUID(), 'act-4', '冯十二', '13800010000', '', 1, 'confirmed', 0, now)

    insertRegistration.run(crypto.randomUUID(), 'act-5', '钱十三', '13800011111', '', 0, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-5', '孔十四', '13800012222', '篮球队长', 1, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-5', '曹十五', '13800013333', '', 2, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-5', '魏十六', '13800014444', '', 1, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-5', '蒋十七', '13800015555', '', 1, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-5', '沈十八', '13800016666', '', 0, 'waitlisted', 0, now)

    insertRegistration.run(crypto.randomUUID(), 'act-6', '韩十九', '13800017777', '推荐《三体》', 0, 'confirmed', 0, now)
    insertRegistration.run(crypto.randomUUID(), 'act-6', '杨二十', '13800018888', '', 0, 'confirmed', 0, now)
  })

  seed()
}

export function getConfirmedCount(activityId: string): number {
  const row = db.prepare(`
    SELECT COALESCE(SUM(1 + bring_friends), 0) as total
    FROM registrations
    WHERE activity_id = ? AND status = 'confirmed'
  `).get(activityId) as { total: number }
  return row.total
}

export function updateActivityStatus(activityId: string): void {
  const activity = db.prepare('SELECT max_participants, status FROM activities WHERE id = ?').get(activityId) as { max_participants: number; status: string } | undefined
  if (!activity) return

  const confirmedCount = getConfirmedCount(activityId)

  if (confirmedCount >= activity.max_participants && activity.status !== 'full') {
    db.prepare("UPDATE activities SET status = 'full' WHERE id = ?").run(activityId)
  } else if (confirmedCount < activity.max_participants && activity.status === 'full') {
    db.prepare("UPDATE activities SET status = 'registering' WHERE id = ?").run(activityId)
  }
}

export default db
