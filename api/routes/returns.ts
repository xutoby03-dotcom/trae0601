import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import type { LendingRecord, LendingItem, Accessory } from '../../shared/types.js';

const router = Router();

function getLendingWithDetails(recordId: string): LendingRecord | null {
  const recordRow = db.prepare(`
    SELECT lr.id AS lr_id, 
           lr.reservation_id, lr.lender_name, lr.lend_date, lr.expected_return_date, lr.created_at AS lr_created_at,
           r.id AS r_id, r.class_name, r.class_contact, r.contact_phone, r.shoot_date, r.time_slot,
           r.head_count, r.size_breakdown_json, r.teacher_in_charge, r.pickup_location,
           r.status AS r_status, r.reject_reason, r.remark AS r_remark,
           r.created_at AS r_created_at, r.updated_at AS r_updated_at
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
    id: recordRow.lr_id,
    reservationId: recordRow.reservation_id,
    lenderName: recordRow.lender_name,
    lendDate: recordRow.lend_date,
    expectedReturnDate: recordRow.expected_return_date,
    createdAt: recordRow.lr_created_at,
    isOverdue,
    items,
    reservation: {
      id: recordRow.r_id,
      className: recordRow.class_name,
      classContact: recordRow.class_contact,
      contactPhone: recordRow.contact_phone,
      shootDate: recordRow.shoot_date,
      timeSlot: recordRow.time_slot,
      headCount: recordRow.head_count,
      sizeBreakdown: JSON.parse(recordRow.size_breakdown_json),
      teacherInCharge: recordRow.teacher_in_charge,
      pickupLocation: recordRow.pickup_location,
      status: recordRow.r_status,
      rejectReason: recordRow.reject_reason,
      remark: recordRow.r_remark,
      createdAt: recordRow.r_created_at,
      updatedAt: recordRow.r_updated_at
    }
  };
}

router.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT lr.id 
      FROM lending_records lr
      INNER JOIN lending_items li ON lr.id = li.lending_record_id
      WHERE li.returned = 0
      ORDER BY lr.expected_return_date ASC
    `).all() as { id: string }[];

    const records = rows.map(r => getLendingWithDetails(r.id)).filter(Boolean) as LendingRecord[];
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id/return', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body as {
      items: Array<{
        costumeId: string;
        accessoryCheck: Accessory;
        hasStain: boolean;
        damageNote?: string;
      }>;
    };

    const record = db.prepare('SELECT * FROM lending_records WHERE id = ?').get(id);
    if (!record) {
      return res.status(404).json({ error: '借出记录不存在' });
    }

    const tx = db.transaction(() => {
      const returnDate = new Date().toISOString().split('T')[0];

      for (const item of items) {
        const missingAccessories: Partial<Accessory> = {};
        let hasDamage = false;
        const damageDescriptions: string[] = [];

        if (!item.accessoryCheck.hat) { missingAccessories.hat = true; hasDamage = true; }
        if (!item.accessoryCheck.tassel) { missingAccessories.tassel = true; hasDamage = true; }
        if (!item.accessoryCheck.bowtie) { missingAccessories.bowtie = true; hasDamage = true; }
        if (!item.accessoryCheck.shawl) { missingAccessories.shawl = true; hasDamage = true; }

        if (item.hasStain) {
          hasDamage = true;
          damageDescriptions.push('服装有污渍');
        }

        if (item.damageNote) {
          hasDamage = true;
          damageDescriptions.push(item.damageNote);
        }

        db.prepare(`
          UPDATE lending_items 
          SET returned = 1, return_date = ?, accessory_check_json = ?, has_stain = ?, damage_note = ?
          WHERE lending_record_id = ? AND costume_id = ?
        `).run(
          returnDate,
          JSON.stringify(item.accessoryCheck),
          item.hasStain ? 1 : 0,
          item.damageNote || null,
          id,
          item.costumeId
        );

        db.prepare(`
          UPDATE costumes 
          SET status = '待清洗', cleaning_status = '待清洗'
          WHERE id = ?
        `).run(item.costumeId);

        if (hasDamage) {
          db.prepare(`
            INSERT INTO damage_records (id, lending_record_id, costume_id, missing_accessories_json, has_stain, damage_description, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuidv4(),
            id,
            item.costumeId,
            JSON.stringify(missingAccessories),
            item.hasStain ? 1 : 0,
            damageDescriptions.join('；') || '配件缺失',
            new Date().toISOString()
          );
        }

        db.prepare(`
          INSERT OR IGNORE INTO cleaning_records (id, costume_id, status, queued_at)
          VALUES (?, ?, '排队中', ?)
        `).run(uuidv4(), item.costumeId, new Date().toISOString());
      }
    });

    tx();

    const damageDetails = db.prepare(`
      SELECT costume_id, missing_accessories_json, has_stain, damage_description
      FROM damage_records 
      WHERE lending_record_id = ?
    `).all(id) as any[];

    const damageMap = damageDetails.reduce((acc, d) => {
      acc[d.costume_id] = {
        missingAccessories: JSON.parse(d.missing_accessories_json || '{}'),
        hasStain: Boolean(d.has_stain),
        damageDescription: d.damage_description
      };
      return acc;
    }, {} as Record<string, any>);

    const updatedRecord = getLendingWithDetails(id);
    res.json({
      ...updatedRecord,
      damageSummary: {
        totalItems: items.length,
        itemsWithDamage: damageDetails.length,
        damagePerCostume: damageMap
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
