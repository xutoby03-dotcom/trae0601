import { db } from '../db/init';
import type { BorrowRecord, ReturnCheck, Costume } from '../../shared/types';

export interface BorrowQuery {
  status?: string;
  costume_id?: string;
  club_name?: string;
  student_name?: string;
  page?: number;
  pageSize?: number;
}

export function getBorrowRecords(query: BorrowQuery = {}) {
  const { status, costume_id, club_name, student_name, page = 1, pageSize = 20 } = query;

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (status) {
    conditions.push('br.status = @status');
    params.status = status;
  }
  if (costume_id) {
    conditions.push('br.costume_id = @costume_id');
    params.costume_id = costume_id;
  }
  if (club_name) {
    conditions.push('br.club_name = @club_name');
    params.club_name = club_name;
  }
  if (student_name) {
    conditions.push('br.student_name LIKE @student_name');
    params.student_name = `%${student_name}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countStmt = db.prepare(`
    SELECT COUNT(*) as total FROM borrow_records br ${whereClause}
  `);
  const { total } = countStmt.get(params) as { total: number };

  const offset = (page - 1) * pageSize;
  const rows = db.prepare(`
    SELECT br.*, c.name as costume_name, c.size as costume_size, c.photo_url as costume_photo
    FROM borrow_records br
    LEFT JOIN costumes c ON br.costume_id = c.id
    ${whereClause}
    ORDER BY br.created_at DESC
    LIMIT @pageSize OFFSET @offset
  `).all({ ...params, pageSize, offset });

  return {
    list: rows as (BorrowRecord & { costume_name?: string; costume_size?: string; costume_photo?: string })[],
    total,
    page,
    pageSize,
  };
}

export function getBorrowRecordById(id: number) {
  const record = db.prepare(`
    SELECT br.*, c.name as costume_name, c.size as costume_size, c.photo_url as costume_photo
    FROM borrow_records br
    LEFT JOIN costumes c ON br.costume_id = c.id
    WHERE br.id = ?
  `).get(id) as (BorrowRecord & { costume_name?: string; costume_size?: string; costume_photo?: string }) | undefined;

  if (!record) return null;

  const returnCheck = db.prepare('SELECT * FROM return_checks WHERE borrow_record_id = ?').get(id) as ReturnCheck | undefined;
  if (returnCheck) {
    (record as unknown as { return_check: ReturnCheck }).return_check = {
      ...returnCheck,
      clothes_ok: !!returnCheck.clothes_ok,
      headdress_ok: !!returnCheck.headdress_ok,
      belt_ok: !!returnCheck.belt_ok,
      shoe_cover_ok: !!returnCheck.shoe_cover_ok,
      clean_ok: !!returnCheck.clean_ok,
      has_stain: !!returnCheck.has_stain,
      has_damage: !!returnCheck.has_damage,
      can_stock: !!returnCheck.can_stock,
    };
  }

  return record;
}

export function getActiveBorrowByCostume(costumeId: string) {
  return db.prepare(`
    SELECT br.*, c.name as costume_name
    FROM borrow_records br
    LEFT JOIN costumes c ON br.costume_id = c.id
    WHERE br.costume_id = ? AND br.status IN ('borrowed', 'overdue')
    ORDER BY br.borrow_date DESC
    LIMIT 1
  `).get(costumeId) as (BorrowRecord & { costume_name?: string }) | undefined;
}

export function createBorrowRecord(data: Omit<BorrowRecord, 'id' | 'status' | 'created_at'>) {
  const costume = db.prepare('SELECT status FROM costumes WHERE id = ?').get(data.costume_id) as Costume | undefined;

  if (!costume) {
    throw new Error('服装不存在');
  }
  if (costume.status !== 'available') {
    throw new Error('该服装当前不可借用');
  }

  const tx = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO borrow_records (costume_id, student_name, club_name, activity_name, borrow_date, expected_return_date, deposit, notes, club_leader_name, club_leader_contact)
      VALUES (@costume_id, @student_name, @club_name, @activity_name, @borrow_date, @expected_return_date, @deposit, @notes, @club_leader_name, @club_leader_contact)
    `).run({
      costume_id: data.costume_id,
      student_name: data.student_name,
      club_name: data.club_name,
      activity_name: data.activity_name || '',
      borrow_date: data.borrow_date,
      expected_return_date: data.expected_return_date,
      deposit: data.deposit || 0,
      notes: data.notes || null,
      club_leader_name: data.club_leader_name || null,
      club_leader_contact: data.club_leader_contact || null,
    });

    db.prepare("UPDATE costumes SET status = 'borrowed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(data.costume_id);

    return result.lastInsertRowid;
  });

  const id = tx();
  return getBorrowRecordById(Number(id));
}

export interface ReturnData {
  clothes_ok: boolean;
  headdress_ok: boolean;
  belt_ok: boolean;
  shoe_cover_ok: boolean;
  clean_ok: boolean;
  has_stain: boolean;
  has_damage: boolean;
  issues?: string;
}

export function returnCostume(borrowId: number, returnData: ReturnData) {
  const record = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(borrowId) as BorrowRecord | undefined;
  if (!record) {
    throw new Error('借用记录不存在');
  }
  if (record.status === 'returned') {
    throw new Error('该服装已归还');
  }

  const canStock =
    returnData.clean_ok &&
    returnData.clothes_ok &&
    returnData.headdress_ok &&
    returnData.belt_ok &&
    returnData.shoe_cover_ok &&
    !returnData.has_stain &&
    !returnData.has_damage;

  const tx = db.transaction(() => {
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE borrow_records
      SET status = 'returned', actual_return_date = ?
      WHERE id = ?
    `).run(today, borrowId);

    db.prepare(`
      INSERT OR REPLACE INTO return_checks
      (borrow_record_id, clothes_ok, headdress_ok, belt_ok, shoe_cover_ok, clean_ok, has_stain, has_damage, issues, can_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      borrowId,
      returnData.clothes_ok ? 1 : 0,
      returnData.headdress_ok ? 1 : 0,
      returnData.belt_ok ? 1 : 0,
      returnData.shoe_cover_ok ? 1 : 0,
      returnData.clean_ok ? 1 : 0,
      returnData.has_stain ? 1 : 0,
      returnData.has_damage ? 1 : 0,
      returnData.issues || null,
      canStock ? 1 : 0
    );

    let newStatus: string;
    let newWashStatus: string;

    if (canStock) {
      newStatus = 'available';
      newWashStatus = 'clean';
    } else if (!returnData.clean_ok || returnData.has_stain) {
      newStatus = 'washing';
      newWashStatus = 'dirty';
    } else {
      newStatus = 'pending';
      newWashStatus = returnData.clean_ok ? 'clean' : 'dirty';
    }

    db.prepare(`
      UPDATE costumes
      SET status = ?, wash_status = ?, use_count = use_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, newWashStatus, record.costume_id);
  });

  tx();
  return getBorrowRecordById(borrowId);
}

export function getOverdueRecords() {
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE borrow_records
    SET status = 'overdue'
    WHERE status = 'borrowed' AND expected_return_date < ?
  `).run(today);

  const records = db.prepare(`
    SELECT br.*, c.name as costume_name, c.size as costume_size, c.photo_url as costume_photo
    FROM borrow_records br
    LEFT JOIN costumes c ON br.costume_id = c.id
    WHERE br.status = 'overdue'
    ORDER BY br.expected_return_date ASC
  `).all() as (BorrowRecord & { costume_name?: string; costume_size?: string; costume_photo?: string; reminder_sent?: number })[];

  return records.map((r) => {
    const expected = new Date(r.expected_return_date);
    const todayDate = new Date();
    const overdueDays = Math.floor((todayDate.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    return { 
      ...r, 
      overdue_days: overdueDays,
      reminder_sent: !!r.reminder_sent,
    };
  });
}

export function markReminderSent(borrowId: number) {
  const record = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(borrowId) as BorrowRecord | undefined;
  if (!record) {
    throw new Error('借用记录不存在');
  }

  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  db.prepare(`
    UPDATE borrow_records
    SET reminder_sent = 1, reminder_at = ?
    WHERE id = ?
  `).run(now, borrowId);

  return getBorrowRecordById(borrowId);
}

export function markAllOverdueReminderSent() {
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE borrow_records
    SET status = 'overdue'
    WHERE status = 'borrowed' AND expected_return_date < ?
  `).run(today);

  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  const result = db.prepare(`
    UPDATE borrow_records
    SET reminder_sent = 1, reminder_at = ?
    WHERE status = 'overdue' AND reminder_sent = 0
  `).run(now);

  return { updated: result.changes };
}
