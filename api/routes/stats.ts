import { Router } from 'express';
import { db } from '../db/index.js';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { DashboardStats, RoomStat, Borrow } from '../../shared/types.js';

interface RoomRow {
  id: number;
  name: string;
  key_number: string;
}

interface BorrowRow {
  id: number;
  room_id: number;
  room_name: string;
  activity_name: string;
  borrower_name: string;
  phone: string;
  start_time: string;
  end_time: string;
  deposit_status: string;
  status: string;
  return_checklist: string | null;
  returned_at: string | null;
  created_at: string;
}

const router = Router();

function rowToBorrow(row: BorrowRow): Borrow {
  let returnChecklist;
  if (row.return_checklist) {
    try {
      returnChecklist = JSON.parse(row.return_checklist);
    } catch {
      returnChecklist = undefined;
    }
  }

  let status = row.status;
  if (status === 'borrowed' && new Date(row.end_time) < new Date()) {
    status = 'overdue';
  }

  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    activityName: row.activity_name,
    borrowerName: row.borrower_name,
    phone: row.phone,
    startTime: row.start_time,
    endTime: row.end_time,
    depositStatus: row.deposit_status as Borrow['depositStatus'],
    status: status as Borrow['status'],
    returnChecklist,
    returnedAt: row.returned_at || undefined,
    createdAt: row.created_at,
  };
}

router.get('/dashboard', (req, res) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

    const rooms = db.prepare('SELECT * FROM rooms ORDER BY id ASC').all() as RoomRow[];

    const roomStats: RoomStat[] = rooms.map((room: RoomRow) => {
      const borrowedCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM borrows
        WHERE room_id = ? AND status = 'borrowed' AND end_time >= ?
      `).get(room.id, now.toISOString()) as { count: number };

      const pendingCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM borrows
        WHERE room_id = ? AND status = 'borrowed'
      `).get(room.id) as { count: number };

      const overdueCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM borrows
        WHERE room_id = ? AND status = 'borrowed' AND end_time < ?
      `).get(room.id, now.toISOString()) as { count: number };

      const weeklyCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM borrows
        WHERE room_id = ? AND created_at >= ? AND created_at <= ?
      `).get(room.id, weekStart, weekEnd) as { count: number };

      return {
        roomId: room.id,
        roomName: room.name,
        keyNumber: room.key_number,
        borrowed: borrowedCount.count,
        pendingReturn: pendingCount.count,
        overdue: overdueCount.count,
        weeklyUsage: weeklyCount.count,
      };
    });

    const totalRooms = rooms.length;
    const totalBorrowed = roomStats.reduce((sum, r) => sum + r.borrowed, 0);
    const totalOverdue = roomStats.reduce((sum, r) => sum + r.overdue, 0);
    const totalWeekly = roomStats.reduce((sum, r) => sum + r.weeklyUsage, 0);

    const overdueRows = db.prepare(`
      SELECT b.*, r.name as room_name
      FROM borrows b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'borrowed' AND b.end_time < ?
      ORDER BY b.end_time ASC
    `).all(now.toISOString()) as BorrowRow[];

    const overdueRecords = overdueRows.map(rowToBorrow);

    const stats: DashboardStats = {
      totalRooms,
      totalBorrowed,
      totalOverdue,
      weeklyUsage: totalWeekly,
      roomStats,
      overdueRecords,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

export default router;
