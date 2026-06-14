import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { Reservation, CostumeSize, TimeSlot, ReservationStatus } from '../../shared/types.js';

const router = Router();

function rowToReservation(row: any): Reservation {
  return {
    id: row.id,
    className: row.class_name,
    classContact: row.class_contact,
    contactPhone: row.contact_phone,
    shootDate: row.shoot_date,
    timeSlot: row.time_slot as TimeSlot,
    headCount: row.head_count,
    sizeBreakdown: JSON.parse(row.size_breakdown_json),
    teacherInCharge: row.teacher_in_charge,
    pickupLocation: row.pickup_location,
    status: row.status as ReservationStatus,
    rejectReason: row.reject_reason,
    remark: row.remark,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const { date, status, className } = req.query;
    let sql = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];

    if (date) {
      sql += ' AND shoot_date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (className) {
      sql += ' AND class_name LIKE ?';
      params.push(`%${className}%`);
    }

    sql += ' ORDER BY shoot_date DESC, time_slot';
    const rows = db.prepare(sql).all(...params);
    const reservations = rows.map(rowToReservation);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: '预约不存在' });
    }
    res.json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { className, classContact, contactPhone, shootDate, timeSlot, headCount, sizeBreakdown, teacherInCharge, pickupLocation, remark } = req.body;

    const reservedSql = `
      SELECT r.size_breakdown_json 
      FROM reservations r
      WHERE r.shoot_date = ? 
        AND r.time_slot = ? 
        AND r.status IN ('待审核', '已通过')
    `;
    const reservedRows = db.prepare(reservedSql).all(shootDate, timeSlot) as { size_breakdown_json: string }[];
    
    const reservedCount: Record<string, number> = {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    };
    for (const row of reservedRows) {
      const breakdown = JSON.parse(row.size_breakdown_json);
      for (const [size, count] of Object.entries(breakdown)) {
        reservedCount[size] = (reservedCount[size] || 0) + (count as number);
      }
    }

    const totalSql = `
      SELECT size, COUNT(*) as count 
      FROM costumes 
      WHERE status IN ('在库', '已预约', '借出中') 
        AND cleaning_status != '待清洗'
      GROUP BY size
    `;
    const totalRows = db.prepare(totalSql).all() as { size: string; count: number }[];
    
    const totalCount: Record<string, number> = {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    };
    for (const row of totalRows) {
      totalCount[row.size] = row.count;
    }

    const requestedBreakdown = sizeBreakdown as Record<CostumeSize, number>;
    const insufficient: string[] = [];
    for (const [size, requested] of Object.entries(requestedBreakdown)) {
      if (requested > 0) {
        const available = Math.max(0, totalCount[size] - reservedCount[size]);
        if (requested > available) {
          insufficient.push(`${size}码: 需要${requested}套，可用${available}套`);
        }
      }
    }

    if (insufficient.length > 0) {
      return res.status(400).json({ 
        error: '库存不足', 
        details: insufficient 
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reservations (id, class_name, class_contact, contact_phone, shoot_date, time_slot, head_count, size_breakdown_json, teacher_in_charge, pickup_location, status, remark, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      className,
      classContact,
      contactPhone,
      shootDate,
      timeSlot,
      headCount,
      JSON.stringify(sizeBreakdown),
      teacherInCharge,
      pickupLocation,
      '待审核',
      remark,
      now,
      now
    );

    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    res.status(201).json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { className, classContact, contactPhone, shootDate, timeSlot, headCount, sizeBreakdown, teacherInCharge, pickupLocation, remark } = req.body;
    
    const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '预约不存在' });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const params: any[] = [];

    if (className !== undefined) { updates.push('class_name = ?'); params.push(className); }
    if (classContact !== undefined) { updates.push('class_contact = ?'); params.push(classContact); }
    if (contactPhone !== undefined) { updates.push('contact_phone = ?'); params.push(contactPhone); }
    if (shootDate !== undefined) { updates.push('shoot_date = ?'); params.push(shootDate); }
    if (timeSlot !== undefined) { updates.push('time_slot = ?'); params.push(timeSlot); }
    if (headCount !== undefined) { updates.push('head_count = ?'); params.push(headCount); }
    if (sizeBreakdown !== undefined) { updates.push('size_breakdown_json = ?'); params.push(JSON.stringify(sizeBreakdown)); }
    if (teacherInCharge !== undefined) { updates.push('teacher_in_charge = ?'); params.push(teacherInCharge); }
    if (pickupLocation !== undefined) { updates.push('pickup_location = ?'); params.push(pickupLocation); }
    if (remark !== undefined) { updates.push('remark = ?'); params.push(remark); }
    
    updates.push('updated_at = ?');
    params.push(now, id);

    db.prepare(`UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    res.json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/approve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE reservations SET status = '已通过', updated_at = ? WHERE id = ? AND status = '待审核'
    `).run(now, id);

    if (result.changes === 0) {
      return res.status(400).json({ error: '预约状态不正确或不存在' });
    }

    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    res.json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/reject', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE reservations SET status = '已驳回', reject_reason = ?, updated_at = ? WHERE id = ? AND status = '待审核'
    `).run(reason, now, id);

    if (result.changes === 0) {
      return res.status(400).json({ error: '预约状态不正确或不存在' });
    }

    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    res.json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE reservations SET status = '已取消', updated_at = ? WHERE id = ? AND status IN ('待审核', '已通过')
    `).run(now, id);

    if (result.changes === 0) {
      return res.status(400).json({ error: '预约状态不正确或不存在' });
    }

    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    res.json(rowToReservation(row));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
