import { Router } from 'express';
import { getDb } from '../db/index.js';
import { generateId } from '../utils/id.js';

const router = Router();
const db = getDb();

// 列表
router.get('/', (req, res) => {
  const { ingredientId, productBatch, startDate, endDate, page = 1, pageSize = 50 } = req.query;
  let sql = 'SELECT * FROM usage_records WHERE 1=1';
  const params = [];

  if (ingredientId) {
    sql += ' AND ingredient_id = ?';
    params.push(ingredientId);
  }
  if (productBatch) {
    sql += ' AND product_batch LIKE ?';
    params.push(`%${productBatch}%`);
  }
  if (startDate) {
    sql += ' AND usage_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND usage_date <= ?';
    params.push(endDate);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);

  const countParams = params.slice(0, -2);
  const total = db.prepare(
    sql.replace('SELECT *', 'SELECT COUNT(*) as cnt').split(' ORDER BY')[0].split(' LIMIT')[0]
  ).get(...countParams).cnt;

  res.json({
    code: 0,
    data: {
      list: rows.map(rowToCamel),
      total,
      page: Number(page),
      pageSize: limit,
    },
  });
});

// 新增取用（同时扣减开封记录剩余量）
router.post('/', (req, res) => {
  const {
    openRecordId, ingredientId, amount, productBatch,
    resealed = true, operator, usageDate, note,
  } = req.body;

  if (!openRecordId || !ingredientId || !amount || !productBatch || !operator || !usageDate) {
    return res.json({ code: 400, msg: '必填项缺失' });
  }

  const openRecord = db.prepare('SELECT * FROM open_records WHERE id = ?').get(openRecordId);
  if (!openRecord) return res.json({ code: 404, msg: '开封记录不存在' });
  if (openRecord.is_discarded) return res.json({ code: 400, msg: '该原料已报废，无法取用' });
  if (amount > openRecord.remaining_weight) {
    return res.json({ code: 400, msg: `取用量不能超过剩余量（${openRecord.remaining_weight}）` });
  }

  const id = generateId();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO usage_records (id, open_record_id, ingredient_id, amount, product_batch,
        resealed, operator, usage_date, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, openRecordId, ingredientId, amount, productBatch,
      resealed ? 1 : 0, operator, usageDate, note || null, createdAt,
    );

    db.prepare(`
      UPDATE open_records SET remaining_weight = remaining_weight - ? WHERE id = ?
    `).run(amount, openRecordId);
  });

  tx();

  const row = db.prepare('SELECT * FROM usage_records WHERE id = ?').get(id);
  const updatedOpen = db.prepare('SELECT * FROM open_records WHERE id = ?').get(openRecordId);

  res.json({
    code: 0,
    data: {
      usage: rowToCamel(row),
      openRecord: {
        id: updatedOpen.id,
        remainingWeight: updatedOpen.remaining_weight,
        isDiscarded: !!updatedOpen.is_discarded,
      },
    },
    msg: '取用记录已创建',
  });
});

function rowToCamel(row) {
  return {
    id: row.id,
    openRecordId: row.open_record_id,
    ingredientId: row.ingredient_id,
    amount: row.amount,
    productBatch: row.product_batch,
    resealed: !!row.resealed,
    operator: row.operator,
    usageDate: row.usage_date,
    note: row.note,
    createdAt: row.created_at,
  };
}

export default router;
