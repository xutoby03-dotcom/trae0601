import { db } from '../db/init';
import type { StatisticsOverview, UsageStat, ClubRanking, MissingRateStat, Costume } from '../../shared/types';

export function getOverview(): StatisticsOverview {
  const totalResult = db.prepare('SELECT COUNT(*) as count FROM costumes').get() as { count: number };
  const borrowedResult = db.prepare("SELECT COUNT(*) as count FROM costumes WHERE status = 'borrowed'").get() as { count: number };
  const washingResult = db.prepare("SELECT COUNT(*) as count FROM costumes WHERE status = 'washing' OR wash_status = 'dirty'").get() as { count: number };

  const today = new Date().toISOString().split('T')[0];
  const overdueResult = db.prepare(`
    SELECT COUNT(*) as count FROM borrow_records
    WHERE status IN ('borrowed', 'overdue') AND expected_return_date < ?
  `).get(today) as { count: number };

  const availableResult = db.prepare("SELECT COUNT(*) as count FROM costumes WHERE status = 'available'").get() as { count: number };

  return {
    total_costumes: totalResult.count,
    borrowed_count: borrowedResult.count,
    washing_count: washingResult.count,
    overdue_count: overdueResult.count,
    available_count: availableResult.count,
  };
}

export function getUsageStats(limit = 10): UsageStat[] {
  return db.prepare(`
    SELECT id as costume_id, name as costume_name, use_count
    FROM costumes
    ORDER BY use_count DESC
    LIMIT ?
  `).all(limit) as UsageStat[];
}

export function getClubRankings() {
  const clubs = db.prepare(`
    SELECT
      club_name,
      COUNT(*) as borrow_count,
      SUM(CASE WHEN status = 'overdue' OR (status = 'returned' AND actual_return_date > expected_return_date) THEN 1 ELSE 0 END) as overdue_count
    FROM borrow_records
    GROUP BY club_name
    ORDER BY borrow_count DESC
  `).all() as ClubRanking[];

  return clubs;
}

export function getMissingRateStats(): MissingRateStat {
  const totalReturns = db.prepare("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'returned'").get() as { count: number };

  const missingReturns = db.prepare(`
    SELECT COUNT(*) as count
    FROM return_checks rc
    JOIN borrow_records br ON rc.borrow_record_id = br.id
    WHERE br.status = 'returned'
    AND (rc.clothes_ok = 0 OR rc.headdress_ok = 0 OR rc.belt_ok = 0 OR rc.shoe_cover_ok = 0)
  `).get() as { count: number };

  const missingRate = totalReturns.count > 0 ? (missingReturns.count / totalReturns.count) * 100 : 0;

  return {
    total_returns: totalReturns.count,
    missing_returns: missingReturns.count,
    missing_rate: Math.round(missingRate * 100) / 100,
  };
}

export function getWashList() {
  return db.prepare(`
    SELECT * FROM costumes
    WHERE wash_status = 'dirty' OR status = 'washing'
    ORDER BY updated_at DESC
  `).all() as Costume[];
}

export function getRecentActivity(limit = 10) {
  return db.prepare(`
    SELECT
      br.id,
      br.costume_id,
      c.name as costume_name,
      br.student_name,
      br.club_name,
      br.activity_name,
      br.status,
      br.borrow_date,
      br.created_at,
      'borrow' as type
    FROM borrow_records br
    LEFT JOIN costumes c ON br.costume_id = c.id
    ORDER BY br.created_at DESC
    LIMIT ?
  `).all(limit);
}
