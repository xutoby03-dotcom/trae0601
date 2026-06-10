import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbDir = path.resolve(__dirname, '../../data')
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

export const db = new Database(path.join(dbDir, 'booth.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exhibitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      venue TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      booth_count INTEGER NOT NULL,
      open_time TEXT NOT NULL,
      close_time TEXT NOT NULL,
      setup_rules TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      grid_rows INTEGER NOT NULL DEFAULT 5,
      grid_cols INTEGER NOT NULL DEFAULT 8,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS booths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      booth_number TEXT NOT NULL,
      row INTEGER NOT NULL,
      col INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'booth',
      zone TEXT DEFAULT 'A',
      max_power_watts INTEGER DEFAULT 2000,
      status TEXT NOT NULL DEFAULT 'available',
      UNIQUE(exhibition_id, booth_number)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      booth_id INTEGER NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
      vendor_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      product_type TEXT NOT NULL,
      power_watts INTEGER DEFAULT 0,
      tables INTEGER DEFAULT 0,
      chairs INTEGER DEFAULT 0,
      has_open_flame INTEGER DEFAULT 0,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS setup_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      booth_id INTEGER NOT NULL REFERENCES booths(id) ON DELETE CASCADE,
      check_in_time TEXT,
      is_late INTEGER DEFAULT 0,
      swap_to_booth_id INTEGER,
      swap_reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conflicts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      related_booth_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_booths_exhibition ON booths(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_applications_exhibition ON applications(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_applications_booth ON applications(booth_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_setup_records_application ON setup_records(application_id);
    CREATE INDEX IF NOT EXISTS idx_conflicts_application ON conflicts(application_id);
  `)
  seedData()
}

function seedData() {
  const exhibitions = db.prepare('SELECT COUNT(*) as c FROM exhibitions').get() as { c: number }
  if (exhibitions.c > 0) return

  const now = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

  const exhibitionsSeed = [
    {
      name: '2026 春日创意市集',
      venue: '万象城中央广场',
      start_date: fmt(addDays(now, 3)),
      end_date: fmt(addDays(now, 5)),
      booth_count: 24,
      open_time: '10:00',
      close_time: '20:00',
      setup_rules: '1. 布展时间 08:00-09:30 请勿迟到；2. 明火摊位需配备灭火器；3. 总用电负荷单摊位不超过 2000W；4. 保持通道畅通。',
      status: 'published',
      grid_rows: 5,
      grid_cols: 8,
    },
    {
      name: '育才小学爱心义卖会',
      venue: '育才小学操场',
      start_date: fmt(addDays(now, 10)),
      end_date: fmt(addDays(now, 10)),
      booth_count: 16,
      open_time: '09:00',
      close_time: '16:00',
      setup_rules: '1. 义卖所得全部捐赠；2. 各班级 8:00 准时入场布展；3. 请保持摊位整洁。',
      status: 'published',
      grid_rows: 4,
      grid_cols: 6,
    },
    {
      name: '星辰科技开放日',
      venue: '星辰科技园 B 栋大厅',
      start_date: fmt(addDays(now, -1)),
      end_date: fmt(addDays(now, 1)),
      booth_count: 12,
      open_time: '09:30',
      close_time: '17:30',
      setup_rules: '1. 公司展示台提前两天布置；2. 各部门负责人签到入场；3. 接待区请保持安静。',
      status: 'ongoing',
      grid_rows: 3,
      grid_cols: 5,
    },
  ]

  const insertEx = db.prepare(
    `INSERT INTO exhibitions (name, venue, start_date, end_date, booth_count, open_time, close_time, setup_rules, status, grid_rows, grid_cols)
     VALUES (@name, @venue, @start_date, @end_date, @booth_count, @open_time, @close_time, @setup_rules, @status, @grid_rows, @grid_cols)`
  )

  const insertBooth = db.prepare(
    `INSERT INTO booths (exhibition_id, booth_number, row, col, type, zone, max_power_watts, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )

  const insertApp = db.prepare(
    `INSERT INTO applications (exhibition_id, booth_id, vendor_name, brand, product_type, power_watts, tables, chairs, has_open_flame, contact_name, contact_phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )

  const insertConflict = db.prepare(
    `INSERT INTO conflicts (application_id, type, message, related_booth_id) VALUES (?, ?, ?, ?)`
  )

  const insertSetup = db.prepare(
    `INSERT INTO setup_records (application_id, booth_id, check_in_time, is_late, swap_to_booth_id, swap_reason)
     VALUES (?, ?, ?, ?, ?, ?)`
  )

  const tx = db.transaction(() => {
    for (const ex of exhibitionsSeed) {
      const info = insertEx.run(ex as any)
      const exId = info.lastInsertRowid as number
      const { grid_rows, grid_cols } = ex
      const aisles = new Set<string>()
      for (let r = 0; r < grid_rows; r++) {
        for (let c = 0; c < grid_cols; c++) {
          if (r === 2 && c === 3) aisles.add(`${r}-${c}`)
          if (r === 2 && c === 4) aisles.add(`${r}-${c}`)
        }
      }
      let boothCount = 0
      for (let r = 0; r < grid_rows; r++) {
        for (let c = 0; c < grid_cols; c++) {
          const key = `${r}-${c}`
          let type: 'booth' | 'aisle' | 'empty' = 'booth'
          const num = String.fromCharCode(65 + r) + (c + 1).toString().padStart(2, '0')
          if (aisles.has(key)) type = 'aisle'
          else if (r === grid_rows - 1 && c === grid_cols - 1) type = 'empty'
          const zone = num[0]
          const maxPower = Math.round(Math.random() * 1000) + 1500
          insertBooth.run(exId, num, r, c, type, zone, maxPower, type === 'booth' ? 'available' : 'available')
          if (type === 'booth') boothCount++
        }
      }
      db.prepare('UPDATE exhibitions SET booth_count = ? WHERE id = ?').run(boothCount, exId)

      const booths = db.prepare(`SELECT id, booth_number FROM booths WHERE exhibition_id = ? AND type = 'booth' ORDER BY id`).all(exId) as { id: number; booth_number: string }[]

      const vendors = [
        { vendor_name: '蓝染工坊', brand: '蓝·印', product_type: '手工艺品', power_watts: 500, tables: 2, chairs: 2, has_open_flame: 0, contact_name: '林师傅', contact_phone: '13800138001' },
        { vendor_name: '手工皮具社', brand: '皮一休', product_type: '手工艺品', power_watts: 800, tables: 2, chairs: 1, has_open_flame: 0, contact_name: '王姐', contact_phone: '13800138002' },
        { vendor_name: '小甜豆烘焙', brand: 'SweetBean', product_type: '食品饮料', power_watts: 2000, tables: 1, chairs: 0, has_open_flame: 1, contact_name: '豆豆', contact_phone: '13800138003' },
        { vendor_name: '茶语香舍', brand: 'TeaMood', product_type: '食品饮料', power_watts: 1800, tables: 2, chairs: 4, has_open_flame: 0, contact_name: '茶艺师小苏', contact_phone: '13800138004' },
        { vendor_name: '晨光文创', brand: 'DawnCraft', product_type: '文创周边', power_watts: 300, tables: 2, chairs: 2, has_open_flame: 0, contact_name: '陈设计师', contact_phone: '13800138005' },
        { vendor_name: '纸飞机书店', brand: 'PaperFly', product_type: '图书印刷', power_watts: 200, tables: 3, chairs: 2, has_open_flame: 0, contact_name: '老吴', contact_phone: '13800138006' },
        { vendor_name: '花时间花坊', brand: 'FlowerTime', product_type: '植物花卉', power_watts: 0, tables: 1, chairs: 0, has_open_flame: 0, contact_name: 'Molly', contact_phone: '13800138007' },
        { vendor_name: '天然草本护肤', brand: 'HerbBeauty', product_type: '美妆个护', power_watts: 600, tables: 2, chairs: 2, has_open_flame: 0, contact_name: 'Mia', contact_phone: '13800138008' },
        { vendor_name: '原创针织工作室', brand: 'KnitLove', product_type: '服饰鞋帽', power_watts: 400, tables: 2, chairs: 1, has_open_flame: 0, contact_name: '阿珍', contact_phone: '13800138009' },
        { vendor_name: '木上家居', brand: 'WoodHome', product_type: '家居日用', power_watts: 0, tables: 2, chairs: 0, has_open_flame: 0, contact_name: '李先生', contact_phone: '13800138010' },
        { vendor_name: '创意电子配件铺', brand: 'GadgetHub', product_type: '数码配件', power_watts: 1500, tables: 2, chairs: 2, has_open_flame: 0, contact_name: '小陈', contact_phone: '13800138011' },
        { vendor_name: '糖霜童年手作', brand: 'SugarCraft', product_type: '手工艺品', power_watts: 1200, tables: 2, chairs: 2, has_open_flame: 1, contact_name: '糖糖', contact_phone: '13800138012' },
      ]

      const nowIso = new Date().toISOString()
      for (let i = 0; i < Math.min(vendors.length, booths.length); i++) {
        const booth = booths[i]
        const v = vendors[i]
        const status = i < 6 ? 'approved' : 'pending'
        const aInfo = insertApp.run(
          exId, booth.id, v.vendor_name, v.brand, v.product_type, v.power_watts,
          v.tables, v.chairs, v.has_open_flame, v.contact_name, v.contact_phone, status
        )
        const appId = aInfo.lastInsertRowid as number

        db.prepare(`UPDATE booths SET status = ? WHERE id = ?`).run(
          status === 'approved' ? 'confirmed' : 'applied', booth.id
        )

        if (i === 0 && booths[i + 1]) {
          insertConflict.run(appId, 'adjacent_type', `相邻摊位 A02 同为手工艺品，品类重复，请考虑调整`, booths[i + 1].id)
          db.prepare(`UPDATE booths SET status = 'conflict' WHERE id = ?`).run(booth.id)
        }
        if (v.power_watts >= 1800) {
          insertConflict.run(appId, 'power_overload', `用电需求 ${v.power_watts}W 接近或超过区域供电上限 2000W`, null)
        }
        if (status === 'approved' && ex.status === 'ongoing') {
          const isLate = i % 3 === 0
          const setupTime = new Date()
          setupTime.setHours(isLate ? 11 : 8, isLate ? 20 : 45)
          insertSetup.run(appId, booth.id, setupTime.toISOString(), isLate ? 1 : 0, null, null)
        }
      }
    }
  })

  tx()
  console.log('数据库初始化完成，已填充示例数据')
}
