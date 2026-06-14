import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.join(__dirname, 'bakery.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

export function initDb() {
  const isNew = !fs.existsSync(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  if (isNew) {
    console.log('📦 数据库初始化完成，正在写入示例数据...');
    seedData();
  }

  return db;
}

export function getDb() {
  if (!db) {
    initDb();
  }
  return db;
}

function seedData() {
  const ingredients = [
    {
      id: 'seed_1',
      name: '淡奶油',
      brand: '安佳',
      batch: 'AC20260601',
      unopened_shelf_life_days: 180,
      opened_days: 3,
      storage_temp_min: 2,
      storage_temp_max: 8,
      photo: null,
      total_weight: 1000,
      unit: 'ml',
      low_stock_threshold: 200,
      created_at: '2026-06-01 10:00:00',
    },
    {
      id: 'seed_2',
      name: '榛子碎',
      brand: '宝茸',
      batch: 'BR20260515',
      unopened_shelf_life_days: 365,
      opened_days: 30,
      storage_temp_min: 10,
      storage_temp_max: 20,
      photo: null,
      total_weight: 500,
      unit: 'g',
      low_stock_threshold: 100,
      created_at: '2026-05-20 14:30:00',
    },
    {
      id: 'seed_3',
      name: '干酵母',
      brand: '燕子',
      batch: 'YZ20260401',
      unopened_shelf_life_days: 730,
      opened_days: 60,
      storage_temp_min: -18,
      storage_temp_max: -5,
      photo: null,
      total_weight: 500,
      unit: 'g',
      low_stock_threshold: 50,
      created_at: '2026-04-10 09:00:00',
    },
    {
      id: 'seed_4',
      name: '黄油',
      brand: '总统',
      batch: 'ZT20260520',
      unopened_shelf_life_days: 240,
      opened_days: 14,
      storage_temp_min: 0,
      storage_temp_max: 6,
      photo: null,
      total_weight: 1000,
      unit: 'g',
      low_stock_threshold: 200,
      created_at: '2026-05-25 11:00:00',
    },
  ];

  const openRecords = [
    {
      id: 'open_1',
      ingredient_id: 'seed_1',
      operator: '张师傅',
      open_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      remaining_weight: 600,
      sealing_method: '保鲜膜',
      freezer_location: '冷藏柜A',
      actual_temp: 5,
      is_discarded: 0,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 9 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id: 'open_2',
      ingredient_id: 'seed_2',
      operator: '李师傅',
      open_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      remaining_weight: 350,
      sealing_method: '密封罐',
      freezer_location: '阴凉处',
      actual_temp: 18,
      is_discarded: 0,
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id: 'open_3',
      ingredient_id: 'seed_4',
      operator: '王师傅',
      open_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      remaining_weight: 450,
      sealing_method: '原包装封口',
      freezer_location: '冷藏柜A',
      actual_temp: 4,
      is_discarded: 0,
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 10.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
  ];

  const usageRecords = [
    {
      id: 'use_1',
      open_record_id: 'open_1',
      ingredient_id: 'seed_1',
      amount: 200,
      product_batch: 'Cake20260612A',
      resealed: 1,
      operator: '张师傅',
      usage_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 10 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id: 'use_2',
      open_record_id: 'open_3',
      ingredient_id: 'seed_4',
      amount: 300,
      product_batch: 'Bread20260612B',
      resealed: 1,
      operator: '王师傅',
      usage_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 9.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id: 'use_3',
      open_record_id: 'open_2',
      ingredient_id: 'seed_2',
      amount: 150,
      product_batch: 'Tart20260611C',
      resealed: 1,
      operator: '李师傅',
      usage_date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 15 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    },
  ];

  const insertIng = db.prepare(`
    INSERT INTO ingredients (id, name, brand, batch, unopened_shelf_life_days, opened_days,
      storage_temp_min, storage_temp_max, photo, total_weight, unit, low_stock_threshold, created_at)
    VALUES (@id, @name, @brand, @batch, @unopened_shelf_life_days, @opened_days,
      @storage_temp_min, @storage_temp_max, @photo, @total_weight, @unit, @low_stock_threshold, @created_at)
  `);

  const insertOpen = db.prepare(`
    INSERT INTO open_records (id, ingredient_id, operator, open_date, remaining_weight,
      sealing_method, freezer_location, actual_temp, is_discarded, created_at)
    VALUES (@id, @ingredient_id, @operator, @open_date, @remaining_weight,
      @sealing_method, @freezer_location, @actual_temp, @is_discarded, @created_at)
  `);

  const insertUsage = db.prepare(`
    INSERT INTO usage_records (id, open_record_id, ingredient_id, amount, product_batch,
      resealed, operator, usage_date, created_at)
    VALUES (@id, @open_record_id, @ingredient_id, @amount, @product_batch,
      @resealed, @operator, @usage_date, @created_at)
  `);

  const tx = db.transaction(() => {
    ingredients.forEach((i) => insertIng.run(i));
    openRecords.forEach((r) => insertOpen.run(r));
    usageRecords.forEach((u) => insertUsage.run(u));
  });

  tx();
  console.log('✅ 示例数据写入完成');
}
