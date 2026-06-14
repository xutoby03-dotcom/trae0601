import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { LendingRecord, LendingItem, Costume, CostumeSize } from '../../shared/types.js';

const router = Router();

function getLendingWithDetails(recordId: string): LendingRecord | null {
  const recordRow = db.prepare(`
    SELECT lr.*, r.* 
    FROM lending_records lr
    LEFT JOIN reservations r ON lr.reservation_id = r.id
    WHERE lr.id = ?
  `).get(recordId) as any;

  if (!recordRow) return null;

  const itemRows = db.prepare(`
    SELECT li.*, c.*
    FROM lending_items li
    LEFT JOIN costumes c ON li.costume_id = c.id
    WHERE li.lending_record_id = ?
  `).all(recordId) as any[];

  const items: LendingItem[] = itemRows.map((row: any) => ({
    id: row.id,
    costumeId: row.costume_id,
    returned: Boolean(row.returned),
    returnDate: row.return_date,
    accessoryCheck: row.accessory_check_json ? JSON.parse(row.accessory_check_json) : undefined,
    hasStain: row.has_stain !== null ? Boolean(row.has_stain) : undefined,
    damageNote: row.damage_note,
    costume: {
      id: row.costume_id,
      type: row.type,
      size: row.size,
      color: row.color,
      accessories: JSON.parse(row.accessories_json),
      status: row.status,
      cleaningStatus: row.cleaning_status,
      photoUrl: row.photo_url,
      rfidTag: row.rfid_tag,
      remark: row.remark,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }));

  const expectedDate = new Date(recordRow.expected_return_date);
  const today = new Date();
  const isOverdue = !items.every(i => i.returned) && today > expectedDate;

  return {
    id: recordRow.id,
    reservationId: recordRow.reservation_id,
    lenderName: recordRow.lender_name,
    lendDate: recordRow.lend_date,
    expectedReturnDate: recordRow.expected_return_date,
    createdAt: recordRow.created_at,
    isOverdue,
    items,
    reservation: {
      id: recordRow.reservation_id,
      className: recordRow.class_name,
      classContact: recordRow.class_contact,
      contactPhone: recordRow.contact_phone,
      shootDate: recordRow.shoot_date,
      timeSlot: recordRow.time_slot,
      headCount: recordRow.head_count,
      sizeBreakdown: JSON.parse(recordRow.size_breakdown_json),
      teacherInCharge: recordRow.teacher_in_charge,
      pickupLocation: recordRow.pickup_location,
      status: recordRow.status,
      rejectReason: recordRow.reject_reason,
      remark: recordRow.remark,
      createdAt: recordRow.created_at,
      updatedAt: recordRow.updated_at
    }
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT lr.id FROM lending_records lr
      ORDER BY lr.created_at DESC
    `).all() as { id: string }[];

    const records = rows.map(r => getLendingWithDetails(r.id)).filter(Boolean) as LendingRecord[];
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { reservationId, lenderName } = req.body;

    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(reservationId) as any;
    if (!reservation) {
      return res.status(404).json({ error: '预约不存在' });
    }

    if (reservation.status !== '已通过') {
      return res.status(400).json({ error: '预约未通过审核，无法借出' });
    }

    const sizeBreakdown = JSON.parse(reservation.size_breakdown_json) as Record<CostumeSize, number>;
    const costumeIds: string[] = [];

    const tx = db.transaction(() => {
      for (const [size, count] of Object.entries(sizeBreakdown)) {
        if (count > 0) {
          const costumes = db.prepare(`
            SELECT id FROM costumes 
            WHERE size = ? AND status = '在库' AND cleaning_status = '干净'
            LIMIT ?
          `).all(size, count) as { id: string }[];

          if (costumes.length < count) {
            throw new Error(`${size}码服装库存不足，需要${count}套，仅余${costumes.length}套`);
          }

          for (const c of costumes) {
            costumeIds.push(c.id);
            db.prepare("UPDATE costumes SET status = '借出中' WHERE id = ?").run(c.id);
          }
        }
      }

      const lendDate = new Date().toISOString();
      const expectedReturn = new Date();
      expectedReturn.setDate(expectedReturn.getDate() + 3);
      const expectedReturnDate = expectedReturn.toISOString().split('T')[0];

      const recordId = uuidv4();
      db.prepare(`
        INSERT INTO lending_records (id, reservation_id, lender_name, lend_date, expected_return_date)
        VALUES (?, ?, ?, ?, ?)
      `).run(recordId, reservationId, lenderName, lendDate, expectedReturnDate);

      const insertItem = db.prepare(`
        INSERT INTO lending_items (id, lending_record_id, costume_id, returned)
        VALUES (?, ?, ?, 0)
      `);

      for (const costumeId of costumeIds) {
        insertItem.run(uuidv4(), recordId, costumeId);
      }

      db.prepare("UPDATE reservations SET status = '已完成' WHERE id = ?").run(reservationId);

      return recordId;
    });

    const recordId = tx();
    const record = getLendingWithDetails(recordId);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = getLendingWithDetails(id);
    if (!record) {
      return res.status(404).json({ error: '借出记录不存在' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
