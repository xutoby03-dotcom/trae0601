import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import type { BorrowRecord, BorrowRecordWithDetails, BorrowStatus, MoldType } from '../../shared/types.js';

const router = Router();

function rowToBorrowRecord(row: any): BorrowRecord {
  return {
    id: row.id,
    moldId: row.mold_id,
    masterId: row.master_id,
    orderNo: row.order_no,
    expectedReturnDate: row.expected_return_date,
    needReleasePaper: !!row.need_release_paper,
    actualReturnDate: row.actual_return_date,
    status: row.status as BorrowStatus,
    borrowDate: row.borrow_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToBorrowWithDetails(row: any): BorrowRecordWithDetails {
  const base: BorrowRecordWithDetails = {
    ...rowToBorrowRecord(row),
    moldName: row.mold_name,
    moldType: row.mold_type as MoldType,
    moldSize: row.mold_size,
    masterName: row.master_name,
    photoUrl: row.mold_photo,
  };

  if (row.inspection_id) {
    base.inspection = {
      id: row.inspection_id,
      borrowRecordId: row.inspection_borrow_record_id,
      hasDeformation: !!row.inspection_has_deformation,
      hasCoatingLoss: !!row.inspection_has_coating_loss,
      hasOilResidue: !!row.inspection_has_oil_residue,
      hasMissingParts: !!row.inspection_has_missing_parts,
      remark: row.inspection_remark || '',
      createdAt: row.inspection_created_at,
    };
  }

  if (row.exception_id) {
    base.exception = {
      id: row.exception_id,
      type: row.exception_type as ExceptionType,
      status: row.exception_status as ExceptionStatus,
      description: row.exception_description,
    };
  }

  return base;
}

type ExceptionType = 'high_temp' | 'overdue' | 'damage' | 'damage_on_return';
type ExceptionStatus = 'pending' | 'processing' | 'resolved' | 'scrapped';

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { masterId, status, moldId } = req.query;

    let sql = `
      SELECT br.*, m.name as mold_name, m.type as mold_type, m.size as mold_size, ma.name as master_name
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (masterId) {
      sql += ' AND br.master_id = ?';
      params.push(masterId);
    }
    if (status) {
      sql += ' AND br.status = ?';
      params.push(status);
    }
    if (moldId) {
      sql += ' AND br.mold_id = ?';
      params.push(moldId);
    }

    sql += ' ORDER BY br.created_at DESC';

    const rows = db.prepare(sql).all(...params) as any[];
    const records = rows.map(rowToBorrowWithDetails);
    res.json(records);
  } catch (error) {
    console.error('Get borrow records error:', error);
    res.status(500).json({ error: '获取借用记录失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT br.*,
             m.name as mold_name, m.type as mold_type, m.size as mold_size, m.photo_url as mold_photo,
             ma.name as master_name,
             ri.id as inspection_id, ri.borrow_record_id as inspection_borrow_record_id,
             ri.has_deformation as inspection_has_deformation,
             ri.has_coating_loss as inspection_has_coating_loss,
             ri.has_oil_residue as inspection_has_oil_residue,
             ri.has_missing_parts as inspection_has_missing_parts,
             ri.remark as inspection_remark, ri.created_at as inspection_created_at,
             ex.id as exception_id, ex.type as exception_type,
             ex.status as exception_status, ex.description as exception_description
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      LEFT JOIN return_inspections ri ON ri.borrow_record_id = br.id
      LEFT JOIN exceptions ex ON ex.borrow_record_id = br.id
      WHERE br.id = ?
    `).get(req.params.id) as any;

    if (!row) {
      return res.status(404).json({ error: '借用记录不存在' });
    }

    res.json(rowToBorrowWithDetails(row));
  } catch (error) {
    console.error('Get borrow record error:', error);
    res.status(500).json({ error: '获取借用记录失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { moldId, masterId, orderNo, expectedReturnDate, needReleasePaper, borrowDate } = req.body;

    if (!moldId || !masterId || !orderNo || !expectedReturnDate) {
      return res.status(400).json({ error: '模具、师傅、订单号、预计归还日期不能为空' });
    }

    const db = getDb();

    const mold = db.prepare('SELECT * FROM molds WHERE id = ?').get(moldId) as any;
    if (!mold) {
      return res.status(404).json({ error: '模具不存在' });
    }

    if (mold.available_quantity <= 0) {
      return res.status(400).json({ error: '该模具已无可用库存' });
    }

    const master = db.prepare('SELECT * FROM masters WHERE id = ?').get(masterId) as any;
    if (!master) {
      return res.status(404).json({ error: '师傅不存在' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (expectedReturnDate < today) {
      return res.status(400).json({ error: '预计归还日期不能早于今天' });
    }

    const id = uuidv4();
    const actualBorrowDate = borrowDate || today;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO borrow_records (
          id, mold_id, master_id, order_no, expected_return_date,
          need_release_paper, borrow_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, moldId, masterId, orderNo, expectedReturnDate,
        needReleasePaper ? 1 : 0, actualBorrowDate, 'borrowed'
      );

      db.prepare(`
        UPDATE molds
        SET available_quantity = available_quantity - 1,
            status = CASE WHEN available_quantity - 1 = 0 THEN 'borrowed' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(moldId);
    });

    transaction();

    const row = db.prepare(`
      SELECT br.*, m.name as mold_name, m.type as mold_type, m.size as mold_size, ma.name as master_name
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      WHERE br.id = ?
    `).get(id) as any;

    res.status(201).json(rowToBorrowWithDetails(row));
  } catch (error) {
    console.error('Create borrow record error:', error);
    res.status(500).json({ error: '创建借用记录失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { orderNo, expectedReturnDate, needReleasePaper, status } = req.body;
    const { id } = req.params;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(id) as any;

    if (!existing) {
      return res.status(404).json({ error: '借用记录不存在' });
    }

    if (existing.status === 'returned') {
      return res.status(400).json({ error: '已归还的记录无法修改' });
    }

    db.prepare(`
      UPDATE borrow_records SET
        order_no = COALESCE(?, order_no),
        expected_return_date = COALESCE(?, expected_return_date),
        need_release_paper = COALESCE(?, need_release_paper),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      orderNo ?? null,
      expectedReturnDate ?? null,
      needReleasePaper !== undefined ? (needReleasePaper ? 1 : 0) : null,
      status ?? null,
      id
    );

    const row = db.prepare(`
      SELECT br.*, m.name as mold_name, m.type as mold_type, m.size as mold_size, ma.name as master_name
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      WHERE br.id = ?
    `).get(id) as any;

    res.json(rowToBorrowWithDetails(row));
  } catch (error) {
    console.error('Update borrow record error:', error);
    res.status(500).json({ error: '更新借用记录失败' });
  }
});

export default router;
