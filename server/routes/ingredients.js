import { Router } from 'express';
import { getDb } from '../db/index.js';
import { generateId } from '../utils/id.js';

const router = Router();
const db = getDb();

// 列表
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM ingredients ORDER BY created_at DESC';
  let params = [];
  if (search) {
    sql = `SELECT * FROM ingredients
           WHERE name LIKE ? OR brand LIKE ? OR batch LIKE ?
           ORDER BY created_at DESC`;
    const s = `%${search}%`;
    params = [s, s, s];
  }
  const rows = db.prepare(sql).all(...params);
  res.json({
    code: 0,
    data: rows.map(rowToCamel),
  });
});

// 详情
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, msg: '原料不存在' });
  res.json({ code: 0, data: rowToCamel(row) });
});

// 新增
router.post('/', (req, res) => {
  const {
    name, brand, batch, unopenedShelfLifeDays, openedDays,
    storageTempMin, storageTempMax, photo, totalWeight, unit, lowStockThreshold,
  } = req.body;

  if (!name || !brand || !batch) {
    return res.json({ code: 400, msg: '名称、品牌、批次不能为空' });
  }

  const id = generateId();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO ingredients (id, name, brand, batch, unopened_shelf_life_days, opened_days,
      storage_temp_min, storage_temp_max, photo, total_weight, unit, low_stock_threshold, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, brand, batch,
    unopenedShelfLifeDays ?? 0, openedDays ?? 0,
    storageTempMin ?? 0, storageTempMax ?? 0,
    photo || null,
    totalWeight ?? 0, unit || 'g',
    lowStockThreshold ?? 0,
    createdAt,
  );

  const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id);
  res.json({ code: 0, data: rowToCamel(row), msg: '创建成功' });
});

// 更新
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM ingredients WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, msg: '原料不存在' });

  const {
    name, brand, batch, unopenedShelfLifeDays, openedDays,
    storageTempMin, storageTempMax, photo, totalWeight, unit, lowStockThreshold,
  } = req.body;

  db.prepare(`
    UPDATE ingredients SET
      name = COALESCE(?, name),
      brand = COALESCE(?, brand),
      batch = COALESCE(?, batch),
      unopened_shelf_life_days = COALESCE(?, unopened_shelf_life_days),
      opened_days = COALESCE(?, opened_days),
      storage_temp_min = COALESCE(?, storage_temp_min),
      storage_temp_max = COALESCE(?, storage_temp_max),
      photo = COALESCE(?, photo),
      total_weight = COALESCE(?, total_weight),
      unit = COALESCE(?, unit),
      low_stock_threshold = COALESCE(?, low_stock_threshold)
    WHERE id = ?
  `).run(
    name ?? null, brand ?? null, batch ?? null,
    unopenedShelfLifeDays ?? null, openedDays ?? null,
    storageTempMin ?? null, storageTempMax ?? null,
    photo ?? null,
    totalWeight ?? null, unit ?? null,
    lowStockThreshold ?? null,
    req.params.id,
  );

  const row = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: rowToCamel(row), msg: '更新成功' });
});

// 删除
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM ingredients WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.json({ code: 404, msg: '原料不存在' });
  res.json({ code: 0, msg: '删除成功' });
});

function rowToCamel(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    batch: row.batch,
    unopenedShelfLifeDays: row.unopened_shelf_life_days,
    openedDays: row.opened_days,
    storageTempMin: row.storage_temp_min,
    storageTempMax: row.storage_temp_max,
    photo: row.photo,
    totalWeight: row.total_weight,
    unit: row.unit,
    lowStockThreshold: row.low_stock_threshold,
    createdAt: row.created_at,
  };
}

export default router;
