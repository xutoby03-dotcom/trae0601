import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'marketplace.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '',
    original_price REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    condition TEXT NOT NULL CHECK(condition IN ('全新', '9成新', '8成新', '7成新', '6成新及以下')),
    accessories_complete INTEGER NOT NULL DEFAULT 1,
    flaws TEXT NOT NULL DEFAULT '',
    photos TEXT NOT NULL DEFAULT '[]',
    category TEXT NOT NULL CHECK(category IN ('数码', '家电', '服装', '书籍', '家居', '其他')),
    current_price REAL NOT NULL,
    suggested_price_min REAL NOT NULL,
    suggested_price_max REAL NOT NULL,
    free_shipping INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'selling' CHECK(status IN ('selling', 'sold')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS price_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    price REAL NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bargain_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    offer_price REAL NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    seller_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
  CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
  CREATE INDEX IF NOT EXISTS idx_items_condition ON items(condition);
  CREATE INDEX IF NOT EXISTS idx_price_records_item ON price_records(item_id);
  CREATE INDEX IF NOT EXISTS idx_bargain_offers_item ON bargain_offers(item_id);
`)

const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number }

if (itemCount.count === 0) {
  const insertItem = db.prepare(`
    INSERT INTO items (name, brand, original_price, purchase_date, condition, accessories_complete, flaws, photos, category, current_price, suggested_price_min, suggested_price_max, free_shipping, status)
    VALUES (@name, @brand, @original_price, @purchase_date, @condition, @accessories_complete, @flaws, @photos, @category, @current_price, @suggested_price_min, @suggested_price_max, @free_shipping, @status)
  `)

  const insertPriceRecord = db.prepare(`
    INSERT INTO price_records (item_id, price, reason)
    VALUES (@item_id, @price, @reason)
  `)

  const seedItems = [
    {
      name: 'iPhone 14 Pro Max 256GB 暗紫色',
      brand: 'Apple',
      original_price: 9999,
      purchase_date: '2023-03-15',
      condition: '9成新',
      accessories_complete: 1,
      flaws: '边框有轻微使用痕迹',
      photos: '[]',
      category: '数码',
      current_price: 5800,
      suggested_price_min: 5200,
      suggested_price_max: 6400,
      free_shipping: 1,
      status: 'selling',
    },
    {
      name: '戴森 V12 Detect Slim 吸尘器',
      brand: 'Dyson',
      original_price: 4490,
      purchase_date: '2022-11-20',
      condition: '8成新',
      accessories_complete: 1,
      flaws: '滤网已更换过一次',
      photos: '[]',
      category: '家电',
      current_price: 2200,
      suggested_price_min: 1900,
      suggested_price_max: 2500,
      free_shipping: 1,
      status: 'selling',
    },
    {
      name: 'Nike Air Jordan 1 Mid 白红黑 42码',
      brand: 'Nike',
      original_price: 1099,
      purchase_date: '2023-06-10',
      condition: '9成新',
      accessories_complete: 1,
      flaws: '鞋底有轻微磨损',
      photos: '[]',
      category: '服装',
      current_price: 550,
      suggested_price_min: 460,
      suggested_price_max: 640,
      free_shipping: 0,
      status: 'selling',
    },
    {
      name: '《深入理解计算机系统》第三版',
      brand: '机械工业出版社',
      original_price: 139,
      purchase_date: '2022-09-01',
      condition: '8成新',
      accessories_complete: 0,
      flaws: '部分页面有笔记标注',
      photos: '[]',
      category: '书籍',
      current_price: 55,
      suggested_price_min: 45,
      suggested_price_max: 65,
      free_shipping: 0,
      status: 'selling',
    },
    {
      name: '宜家 KALLAX 卡莱克 书架 白色',
      brand: 'IKEA',
      original_price: 599,
      purchase_date: '2023-01-15',
      condition: '9成新',
      accessories_complete: 1,
      flaws: '无',
      photos: '[]',
      category: '家居',
      current_price: 320,
      suggested_price_min: 280,
      suggested_price_max: 360,
      free_shipping: 0,
      status: 'selling',
    },
    {
      name: 'Sony WH-1000XM5 降噪耳机 银色',
      brand: 'Sony',
      original_price: 2999,
      purchase_date: '2023-08-20',
      condition: '全新',
      accessories_complete: 1,
      flaws: '未拆封',
      photos: '[]',
      category: '数码',
      current_price: 2200,
      suggested_price_min: 2000,
      suggested_price_max: 2400,
      free_shipping: 1,
      status: 'selling',
    },
    {
      name: '小米空气净化器 4 Pro',
      brand: '小米',
      original_price: 1499,
      purchase_date: '2022-05-10',
      condition: '7成新',
      accessories_complete: 1,
      flaws: '外壳有轻微划痕，滤芯需更换',
      photos: '[]',
      category: '家电',
      current_price: 480,
      suggested_price_min: 400,
      suggested_price_max: 560,
      free_shipping: 0,
      status: 'selling',
    },
    {
      name: '优衣库轻薄羽绒服 黑色 L码',
      brand: 'UNIQLO',
      original_price: 799,
      purchase_date: '2022-12-01',
      condition: '8成新',
      accessories_complete: 0,
      flaws: '收纳袋遗失',
      photos: '[]',
      category: '服装',
      current_price: 280,
      suggested_price_min: 230,
      suggested_price_max: 330,
      free_shipping: 0,
      status: 'sold',
    },
    {
      name: 'iPad Air 5 64GB 星光色 WiFi版',
      brand: 'Apple',
      original_price: 4799,
      purchase_date: '2023-04-15',
      condition: '9成新',
      accessories_complete: 1,
      flaws: '屏幕贴膜有气泡',
      photos: '[]',
      category: '数码',
      current_price: 2900,
      suggested_price_min: 2600,
      suggested_price_max: 3200,
      free_shipping: 1,
      status: 'selling',
    },
    {
      name: '《算法导论》第三版 英文原版',
      brand: 'MIT Press',
      original_price: 298,
      purchase_date: '2021-09-01',
      condition: '7成新',
      accessories_complete: 0,
      flaws: '书脊有磨损，部分章节有高亮',
      photos: '[]',
      category: '书籍',
      current_price: 88,
      suggested_price_min: 70,
      suggested_price_max: 105,
      free_shipping: 0,
      status: 'selling',
    },
  ]

  const transaction = db.transaction(() => {
    for (const item of seedItems) {
      const result = insertItem.run(item)
      insertPriceRecord.run({
        item_id: result.lastInsertRowid,
        price: item.current_price,
        reason: '初始定价',
      })
    }
  })

  transaction()
}

export default db
