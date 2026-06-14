import { Router } from 'express';
import { getDb } from '../db/index.js';
import { generateId } from '../utils/id.js';

const router = Router();
const db = getDb();

// 列表
router.get('/', (req, res) => {
  const { status = 'all', ingredientId } = req.query;
  let sql = 'SELECT * FROM open_records WHERE 1=1';
  const params = [];

  if (status === 'active') {
    sql += ' AND is_discarded = 0';
  } else if (status === 'discarded') {
    sql += ' AND is_discarded = 1';
  }
  if (ingredientId) {
    sql += ' AND ingredient_id = ?';
    params.push(ingredientId);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({
    code: 0,
    data: rows.map(rowToCamel),
  });
});

// 详情
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM open_records WHERE id = ?').get(req.params.id);
  if (!row) return res.json({ code: 404, msg: '记录不存在' });

  const usages = db.prepare(
    'SELECT * FROM usage_records WHERE open_record_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);

  res.json({
    code: 0,
    data: {
      ...rowToCamel(row),
      usageHistory: usages.map((u) => ({
        id: u.id,
        amount: u.amount,
        productBatch: u.product_batch,
        resealed: !!u.resealed,
        operator: u.operator,
        usageDate: u.usage_date,
        note: u.note,
        createdAt: u.created_at,
      })),
    },
  });
});

// 新建开封
router.post('/', (req, res) => {
  const {
    ingredientId, operator, openDate, remainingWeight,
    sealingMethod, freezerLocation, actualTemp,
  } = req.body;

  if (!ingredientId || !operator || !openDate || !sealingMethod || !freezerLocation) {
    return res.json({ code: 400, msg: '必填项缺失' });
  }

  const ing = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ingredientId);
  if (!ing) return res.json({ code: 404, msg: '原料不存在' });

  const id = generateId();
  const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const weight = remainingWeight ?? ing.total_weight;

  db.prepare(`
    INSERT INTO open_records (id, ingredient_id, operator, open_date, remaining_weight,
      sealing_method, freezer_location, actual_temp, is_discarded, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, ingredientId, operator, openDate, weight, sealingMethod, freezerLocation, actualTemp ?? null, createdAt);

  const row = db.prepare('SELECT * FROM open_records WHERE id = ?').get(id);
  res.json({ code: 0, data: rowToCamel(row), msg: '开封记录已创建' });
});

// 报废
router.post('/:id/discard', (req, res) => {
  const existing = db.prepare('SELECT * FROM open_records WHERE id = ?').get(req.params.id);
  if (!existing) return res.json({ code: 404, msg: '记录不存在' });
  if (existing.is_discarded) return res.json({ code: 400, msg: '已报废，不可重复操作' });

  const { reason, operator, note } = req.body;
  if (!reason || !operator) return res.json({ code: 400, msg: '原因和操作人必填' });

  const discardDate = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE open_records SET
      is_discarded = 1,
      discard_reason = ?,
      discard_date = ?,
      discard_operator = ?,
      discard_note = ?
    WHERE id = ?
  `).run(reason, discardDate, operator, note || null, req.params.id);

  const row = db.prepare('SELECT * FROM open_records WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: rowToCamel(row), msg: '已标记为报废' });
});

function rowToCamel(row) {
  return {
    id: row.id,
    ingredientId: row.ingredient_id,
    operator: row.operator,
    openDate: row.open_date,
    remainingWeight: row.remaining_weight,
    sealingMethod: row.sealing_method,
    freezerLocation: row.freezer_location,
    actualTemp: row.actual_temp,
    isDiscarded: !!row.is_discarded,
    discardReason: row.discard_reason,
    discardDate: row.discard_date,
    discardOperator: row.discard_operator,
    discardNote: row.discard_note,
    createdAt: row.created_at,
  };
}

export default router;
