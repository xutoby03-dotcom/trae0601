import dayjs from 'dayjs';
import { db } from '../db/connection';
import { bookingRepository } from '../repositories/BookingRepository';
import { damageRepository } from '../repositories/DamageRepository';
import { UsageStats, PopularTimeSlot, NoShowRecord, DamagePartStats } from '../../shared/types';

export class AdminService {
  getUsageStats(days: number = 7): UsageStats[] {
    const result: UsageStats[] = [];
    const totalChairs = db.prepare('SELECT COUNT(*) as count FROM chairs').get() as { count: number };
    const slotsPerDay = 16;
    const totalSlotsPerDay = totalChairs.count * slotsPerDay;

    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const usedSlots = db.prepare(`
        SELECT COUNT(*) as count FROM bookings
        WHERE date = ? AND status IN ('checked_in', 'completed')
      `).get(date) as { count: number };

      result.push({
        date,
        totalSlots: totalSlotsPerDay,
        usedSlots: usedSlots.count,
        usageRate: totalSlotsPerDay > 0 ? Math.round((usedSlots.count / totalSlotsPerDay) * 100) : 0,
      });
    }

    return result;
  }

  getPopularTimes(): PopularTimeSlot[] {
    const rows = db.prepare(`
      SELECT start_time as time, COUNT(*) as count
      FROM bookings
      WHERE status IN ('checked_in', 'completed')
      AND date >= ?
      GROUP BY start_time
      ORDER BY count DESC
    `).all(dayjs().subtract(30, 'day').format('YYYY-MM-DD')) as PopularTimeSlot[];

    return rows;
  }

  getNoShowList(): NoShowRecord[] {
    const rows = db.prepare(`
      SELECT 
        u.id as userId,
        u.name as userName,
        u.employee_id as employeeId,
        COUNT(*) as count,
        COUNT(*) * 10 as totalPenalty
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'no_show'
      GROUP BY u.id, u.name, u.employee_id
      ORDER BY count DESC
    `).all() as NoShowRecord[];

    return rows;
  }

  getDamagePartStats(): DamagePartStats[] {
    return damageRepository.getPartStats();
  }

  getTodaySummary() {
    const today = dayjs().format('YYYY-MM-DD');
    const totalBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE date = ?
    `).get(today) as { count: number };

    const completedBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE date = ? AND status = 'completed'
    `).get(today) as { count: number };

    const checkedInBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE date = ? AND status = 'checked_in'
    `).get(today) as { count: number };

    const noShows = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE date = ? AND status = 'no_show'
    `).get(today) as { count: number };

    const pendingBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE date = ? AND status = 'pending'
    `).get(today) as { count: number };

    const dirtyChairs = db.prepare(`
      SELECT COUNT(*) as count FROM chairs WHERE status = 'dirty'
    `).get() as { count: number };

    const chairsInUse = db.prepare(`
      SELECT COUNT(*) as count FROM chairs WHERE status = 'in_use'
    `).get() as { count: number };

    return {
      today,
      totalBookings: totalBookings.count,
      completedBookings: completedBookings.count,
      checkedInBookings: checkedInBookings.count,
      noShows: noShows.count,
      pendingBookings: pendingBookings.count,
      dirtyChairs: dirtyChairs.count,
      chairsInUse: chairsInUse.count,
    };
  }
}

export const adminService = new AdminService();
