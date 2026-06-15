import { Router, Request, Response } from 'express';
import db from '../database.js';

const router = Router();

router.get('/overview', (req: Request, res: Response) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const todayInspections = db
      .prepare("SELECT COUNT(*) as count FROM inspections WHERE inspection_time >= ?")
      .get(todayStart) as { count: number };

    const pendingTickets = db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('pending', 'processing')")
      .get() as { count: number };

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const monthProblems = db
      .prepare("SELECT COUNT(*) as count FROM inspections WHERE inspection_time >= ?")
      .get(monthStart) as { count: number };

    const totalResolved = db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE status IN ('resolved', 'closed')")
      .get() as { count: number };

    const totalTickets = db.prepare("SELECT COUNT(*) as count FROM tickets").get() as { count: number };

    const completionRate = totalTickets.count > 0
      ? Math.round((totalResolved.count / totalTickets.count) * 100)
      : 0;

    const monthStartStr = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const lastMonthProblems = db
      .prepare("SELECT COUNT(*) as count FROM inspections WHERE inspection_time >= ? AND inspection_time < ?")
      .get(prevMonthStart.toISOString(), monthStartStr.toISOString()) as { count: number };

    const problemChange = lastMonthProblems.count > 0
      ? Math.round(((monthProblems.count - lastMonthProblems.count) / lastMonthProblems.count) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        todayInspections: todayInspections.count,
        pendingTickets: pendingTickets.count,
        monthProblems: monthProblems.count,
        completionRate,
        problemChange,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取概览统计失败' });
  }
});

router.get('/trend', (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const numDays = Number(days);

    const result: { date: string; count: number }[] = [];
    const today = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      result.push({ date: dateStr, count: 0 });
    }

    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - numDays + 1);
    startDate.setHours(0, 0, 0, 0);

    const inspections = db
      .prepare(
        `SELECT DATE(inspection_time) as date, COUNT(*) as count 
         FROM inspections 
         WHERE inspection_time >= ?
         GROUP BY DATE(inspection_time)
         ORDER BY date`
      )
      .all(startDate.toISOString()) as { date: string; count: number }[];

    inspections.forEach((item) => {
      const date = new Date(item.date);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const idx = result.findIndex((r) => r.date === dateStr);
      if (idx !== -1) {
        result[idx].count = item.count;
      }
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取趋势数据失败' });
  }
});

router.get('/error-types', (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query;
    const numDays = Number(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const inspections = db
      .prepare('SELECT problem_types FROM inspections WHERE inspection_time >= ?')
      .all(startDate.toISOString()) as { problem_types: string }[];

    const typeCount: Record<string, number> = {};

    inspections.forEach((inspection) => {
      const types = JSON.parse(inspection.problem_types || '[]');
      types.forEach((type: string) => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    });

    const result = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    result.sort((a, b) => b.value - a.value);

    const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];
    const dataWithColors = result.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }));

    res.json({ success: true, data: dataWithColors });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取错误类型统计失败' });
  }
});

router.get('/recurrence', (req: Request, res: Response) => {
  try {
    const { days = '30', limit = '10' } = req.query;
    const numDays = Number(days);
    const numLimit = Number(limit);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const points = db
      .prepare(
        `SELECT p.id, p.building, p.location, COUNT(i.id) as problem_count
         FROM points p
         LEFT JOIN inspections i ON p.id = i.point_id
         WHERE i.inspection_time >= ?
         GROUP BY p.id
         ORDER BY problem_count DESC
         LIMIT ?`
      )
      .all(startDate.toISOString(), numLimit) as any[];

    const result = points.map((point) => ({
      id: point.id,
      building: point.building,
      location: point.location,
      problemCount: point.problem_count,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取复发统计失败' });
  }
});

router.get('/repair-time', (req: Request, res: Response) => {
  try {
    const tickets = db
      .prepare(
        `SELECT t.*, p.building 
         FROM tickets t
         LEFT JOIN points p ON t.point_id = p.id
         WHERE t.status IN ('resolved', 'closed')
         AND t.assigned_at IS NOT NULL
         AND t.resolved_at IS NOT NULL`
      )
      .all() as any[];

    const pointStats: Record<string, { building: string; totalHours: number; count: number }> = {};

    tickets.forEach((ticket) => {
      const assignedAt = new Date(ticket.assigned_at).getTime();
      const resolvedAt = new Date(ticket.resolved_at).getTime();
      const hours = Math.max(0, (resolvedAt - assignedAt) / (1000 * 60 * 60));

      if (!pointStats[ticket.point_id]) {
        pointStats[ticket.point_id] = {
          building: ticket.building,
          totalHours: 0,
          count: 0,
        };
      }
      pointStats[ticket.point_id].totalHours += hours;
      pointStats[ticket.point_id].count += 1;
    });

    const result = Object.entries(pointStats).map(([pointId, stats]) => ({
      pointId: Number(pointId),
      building: stats.building,
      avgHours: Math.round((stats.totalHours / stats.count) * 10) / 10,
      ticketCount: stats.count,
    }));

    result.sort((a, b) => b.avgHours - a.avgHours);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取整改时效统计失败' });
  }
});

router.get('/focus-buildings', (req: Request, res: Response) => {
  try {
    const { threshold = '5' } = req.query;
    const numThreshold = Number(threshold);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const points = db
      .prepare(
        `SELECT p.id, p.building, p.location, p.supervisor,
                COUNT(i.id) as problem_count
         FROM points p
         LEFT JOIN inspections i ON p.id = i.point_id
         WHERE i.inspection_time >= ?
         GROUP BY p.id
         HAVING problem_count >= ?
         ORDER BY problem_count DESC`
      )
      .all(thirtyDaysAgo.toISOString(), numThreshold) as any[];

    const result = points.map((point) => {
      const promotions = db
        .prepare(
          `SELECT COUNT(*) as count 
           FROM promotions 
           WHERE related_points LIKE ?`
        )
        .get(`%${point.id}%`) as { count: number };

      return {
        id: point.id,
        building: point.building,
        location: point.location,
        supervisor: point.supervisor,
        problemCount: point.problem_count,
        promotionCount: promotions.count,
        priority: point.problem_count >= 8 ? 'high' : point.problem_count >= 6 ? 'medium' : 'low',
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取重点宣传楼栋失败' });
  }
});

router.get('/point/:pointId/recurrence', (req: Request, res: Response) => {
  try {
    const { pointId } = req.params;
    const { days = '30' } = req.query;
    const numDays = Number(days);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - numDays);

    const inspections = db
      .prepare(
        `SELECT problem_types, inspection_time
         FROM inspections
         WHERE point_id = ? AND inspection_time >= ?
         ORDER BY inspection_time DESC`
      )
      .all(pointId, thirtyDaysAgo.toISOString()) as { problem_types: string; inspection_time: string }[];

    const typeStats: Record<string, { count: number; lastOccurrence: string }> = {};
    let totalProblems = 0;

    inspections.forEach((inspection) => {
      const types = JSON.parse(inspection.problem_types || '[]') as string[];
      types.forEach((type) => {
        totalProblems++;
        if (!typeStats[type]) {
          typeStats[type] = { count: 0, lastOccurrence: inspection.inspection_time };
        }
        typeStats[type].count++;
        if (new Date(inspection.inspection_time) > new Date(typeStats[type].lastOccurrence)) {
          typeStats[type].lastOccurrence = inspection.inspection_time;
        }
      });
    });

    const openTickets = db
      .prepare(
        `SELECT COUNT(*) as count FROM tickets
         WHERE point_id = ? AND status != 'closed'`
      )
      .get(pointId) as { count: number };

    const problemTypes = Object.entries(typeStats)
      .map(([problemType, stats]) => ({
        problemType,
        count: stats.count,
        lastOccurrence: stats.lastOccurrence,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        problemTypes,
        openTickets: openTickets.count,
        totalProblems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取点位复发统计失败' });
  }
});

export default router;
