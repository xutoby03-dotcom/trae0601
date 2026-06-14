import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import type { Statistics, DamageRecord, LendingRecord, CostumeSize, CostumeStatus } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const sizeRows = db.prepare(`
      SELECT size, COUNT(*) as count 
      FROM costumes 
      GROUP BY size
    `).all() as { size: string; count: number }[];

    const sizeDemand: Record<string, number> = {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    };
    for (const row of sizeRows) {
      sizeDemand[row.size] = row.count;
    }

    const reservationRows = db.prepare(`
      SELECT size_breakdown_json 
      FROM reservations 
      WHERE status IN ('待审核', '已通过')
    `).all() as { size_breakdown_json: string }[];

    for (const row of reservationRows) {
      const breakdown = JSON.parse(row.size_breakdown_json);
      for (const [size, count] of Object.entries(breakdown)) {
        sizeDemand[size] = (sizeDemand[size] || 0) + (count as number);
      }
    }

    const overdueCount = db.prepare(`
      SELECT COUNT(DISTINCT lr.id) as count
      FROM lending_records lr
      INNER JOIN lending_items li ON lr.id = li.lending_record_id
      WHERE li.returned = 0 AND lr.expected_return_date < DATE('now')
    `).get() as { count: number };

    const missingAccessoryCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM damage_records 
      WHERE resolved = 0 AND missing_accessories_json != '{}'
    `).get() as { count: number };

    const cleaningQueueCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM cleaning_records 
      WHERE status IN ('排队中', '清洗中')
    `).get() as { count: number };

    const statusRows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM costumes 
      GROUP BY status
    `).all() as { status: string; count: number }[];

    const statusDistribution: Record<string, number> = {
      '在库': 0, '已预约': 0, '借出中': 0, '待清洗': 0, '清洗中': 0, '已报废': 0
    };
    for (const row of statusRows) {
      statusDistribution[row.status] = row.count;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayReservations = db.prepare(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE shoot_date = ? AND status IN ('待审核', '已通过')
    `).get(today) as { count: number };

    const lendingCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM lending_records
    `).get() as { count: number };

    const statistics: Statistics = {
      sizeDemand: sizeDemand as Record<CostumeSize, number>,
      overdueCount: overdueCount.count,
      missingAccessoryCount: missingAccessoryCount.count,
      cleaningQueueCount: cleaningQueueCount.count,
      statusDistribution: statusDistribution as Record<CostumeStatus, number>,
      todayReservations: todayReservations.count,
      lendingCount: lendingCount.count
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/damages', (req: Request, res: Response) => {
  try {
    const { resolved } = req.query;
    let sql = `
      SELECT dr.*, 
             c.type, c.size, c.color, c.accessories_json, 
             c.status as costume_status, c.cleaning_status, c.photo_url, 
             c.rfid_tag, c.remark as costume_remark, 
             c.created_at as costume_created_at, c.updated_at as costume_updated_at
      FROM damage_records dr
      LEFT JOIN costumes c ON dr.costume_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (resolved !== undefined) {
      sql += ' AND dr.resolved = ?';
      params.push(resolved === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY dr.recorded_at DESC';
    const rows = db.prepare(sql).all(...params);

    const records = rows.map((row: any) => ({
      id: row.id,
      lendingRecordId: row.lending_record_id,
      costumeId: row.costume_id,
      missingAccessories: JSON.parse(row.missing_accessories_json),
      hasStain: Boolean(row.has_stain),
      damageDescription: row.damage_description,
      recordedAt: row.recorded_at,
      resolved: Boolean(row.resolved),
      resolvedAt: row.resolved_at,
      costume: {
        id: row.costume_id,
        type: row.type,
        size: row.size,
        color: row.color,
        accessories: JSON.parse(row.accessories_json),
        status: row.costume_status,
        cleaningStatus: row.cleaning_status,
        photoUrl: row.photo_url,
        rfidTag: row.rfid_tag,
        remark: row.costume_remark,
        createdAt: row.costume_created_at,
        updatedAt: row.costume_updated_at
      }
    }));

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/overdue', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT lr.id
      FROM lending_records lr
      INNER JOIN lending_items li ON lr.id = li.lending_record_id
      INNER JOIN reservations r ON lr.reservation_id = r.id
      WHERE li.returned = 0 AND lr.expected_return_date < DATE('now')
      ORDER BY lr.expected_return_date ASC
    `).all() as { id: string }[];

    const getLendingWithDetails = (recordId: string): LendingRecord | null => {
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
    
      const items = itemRows.map((row: any) => ({
        id: row.id,
        costumeId: row.costume_id,
        returned: Boolean(row.returned),
        returnDate: row.return_date,
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
    
      return {
        id: recordRow.id,
        reservationId: recordRow.reservation_id,
        lenderName: recordRow.lender_name,
        lendDate: recordRow.lend_date,
        expectedReturnDate: recordRow.expected_return_date,
        createdAt: recordRow.created_at,
        isOverdue: true,
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
    };

    const records = rows.map(r => getLendingWithDetails(r.id)).filter(Boolean) as LendingRecord[];
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
