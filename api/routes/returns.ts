import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { ReturnInspection, ExceptionType } from '../../shared/types.js';

const router = Router();

function rowToReturnInspection(row: any): ReturnInspection {
  return {
    id: row.id,
    borrowRecordId: row.borrow_record_id,
    hasDeformation: !!row.has_deformation,
    hasCoatingLoss: !!row.has_coating_loss,
    hasOilResidue: !!row.has_oil_residue,
    hasMissingParts: !!row.has_missing_parts,
    remark: row.remark || '',
    createdAt: row.created_at,
  };
}

router.get('/pending', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT br.*, m.name as mold_name, m.type as mold_type, m.size as mold_size, ma.name as master_name
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      WHERE br.status IN ('borrowed', 'overdue')
      ORDER BY br.expected_return_date ASC
    `).all() as any[];

    res.json(rows);
  } catch (error) {
    console.error('Get pending returns error:', error);
    res.status(500).json({ error: '获取待归还列表失败' });
  }
});

router.post('/:borrowId', (req: Request, res: Response) => {
  try {
    const { borrowId } = req.params;
    const {
      hasDeformation,
      hasCoatingLoss,
      hasOilResidue,
      hasMissingParts,
      remark,
    } = req.body;

    const db = getDb();

    const borrowRecord = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(borrowId) as any;
    if (!borrowRecord) {
      return res.status(404).json({ error: '借用记录不存在' });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({ error: '该借用记录已归还' });
    }

    const hasDamage = hasDeformation || hasCoatingLoss || hasMissingParts;
    const today = new Date().toISOString().split('T')[0];
    const inspectionId = uuidv4();

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO return_inspections (
          id, borrow_record_id, has_deformation, has_coating_loss,
          has_oil_residue, has_missing_parts, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        inspectionId, borrowId,
        hasDeformation ? 1 : 0,
        hasCoatingLoss ? 1 : 0,
        hasOilResidue ? 1 : 0,
        hasMissingParts ? 1 : 0,
        remark || ''
      );

      db.prepare(`
        UPDATE borrow_records
        SET actual_return_date = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(today, hasDamage ? 'exception' : 'returned', borrowId);

      db.prepare(`
        UPDATE molds
        SET available_quantity = available_quantity + 1,
            status = CASE
              WHEN ? = 1 THEN 'maintenance'
              WHEN available_quantity + 1 > 0 THEN 'available'
              ELSE status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(hasDamage ? 1 : 0, borrowRecord.mold_id);

      if (hasDamage) {
        const mold = db.prepare('SELECT name FROM molds WHERE id = ?').get(borrowRecord.mold_id) as any;
        const master = db.prepare('SELECT name FROM masters WHERE id = ?').get(borrowRecord.master_id) as any;
        const damageDescriptions: string[] = [];
        if (hasDeformation) damageDescriptions.push('变形');
        if (hasCoatingLoss) damageDescriptions.push('掉涂层');
        if (hasMissingParts) damageDescriptions.push('缺件');

        const exceptionId = uuidv4();
        const exceptionType: ExceptionType = 'damage_on_return';
        const description = `归还时发现模具[${mold.name}]存在${damageDescriptions.join('、')}问题，借用人：${master.name}${remark ? `，备注：${remark}` : ''}`;

        db.prepare(`
          INSERT INTO exception_records (
            id, mold_id, borrow_record_id, type, description, status
          ) VALUES (?, ?, ?, ?, ?, 'pending')
        `).run(exceptionId, borrowRecord.mold_id, borrowId, exceptionType, description);
      }
    });

    transaction();

    const inspection = db.prepare(
      'SELECT * FROM return_inspections WHERE id = ?'
    ).get(inspectionId) as any;

    res.status(201).json({
      inspection: rowToReturnInspection(inspection),
      hasDamage,
    });
  } catch (error) {
    console.error('Process return error:', error);
    res.status(500).json({ error: '处理归还失败' });
  }
});

router.get('/inspection/:borrowId', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM return_inspections WHERE borrow_record_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(req.params.borrowId) as any;

    if (!row) {
      return res.status(404).json({ error: '未找到检查记录' });
    }

    res.json(rowToReturnInspection(row));
  } catch (error) {
    console.error('Get inspection error:', error);
    res.status(500).json({ error: '获取检查记录失败' });
  }
});

export default router;
