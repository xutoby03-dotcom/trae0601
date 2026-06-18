import { Router, Request, Response } from 'express';
import { getDb } from '../db/index.js';
import type { DashboardStats, UsageBySize, PurchaseSuggestion, BorrowConflict } from '../../shared/types.js';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const totalMolds = db.prepare('SELECT COUNT(*) as count FROM molds').get() as { count: number };

    const availableMolds = db.prepare(
      "SELECT SUM(available_quantity) as count FROM molds WHERE status = 'available'"
    ).get() as { count: number };

    const borrowedMolds = db.prepare(
      "SELECT COUNT(*) as count FROM borrow_records WHERE status IN ('borrowed', 'overdue')"
    ).get() as { count: number };

    const exceptionMolds = db.prepare(
      "SELECT COUNT(*) as count FROM exception_records WHERE status != 'resolved'"
    ).get() as { count: number };

    const today = new Date().toISOString().split('T')[0];
    const overdueCount = db.prepare(
      "SELECT COUNT(*) as count FROM borrow_records WHERE status = 'overdue'"
    ).get() as { count: number };

    const conflictCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM (
        SELECT mold_id, COUNT(*) as borrow_count
        FROM borrow_records
        WHERE status IN ('borrowed', 'overdue')
        GROUP BY mold_id
        HAVING borrow_count > 1
      ) t
    `).get() as { count: number };

    const stats: DashboardStats = {
      totalMolds: totalMolds.count,
      availableMolds: availableMolds.count || 0,
      borrowedMolds: borrowedMolds.count,
      exceptionMolds: exceptionMolds.count,
      overdueCount: overdueCount.count,
      conflictCount: conflictCount.count,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

router.get('/conflicts', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const conflicts = db.prepare(`
      SELECT
        m.id as mold_id,
        m.name as mold_name,
        br.id as borrow_id,
        ma.name as master_name,
        br.order_no,
        br.expected_return_date
      FROM molds m
      JOIN borrow_records br ON m.id = br.mold_id
      JOIN masters ma ON br.master_id = ma.id
      WHERE br.status IN ('borrowed', 'overdue')
      AND m.id IN (
        SELECT mold_id
        FROM borrow_records
        WHERE status IN ('borrowed', 'overdue')
        GROUP BY mold_id
        HAVING COUNT(*) > 1
      )
      ORDER BY m.id, br.borrow_date
    `).all() as Array<{
      mold_id: string;
      mold_name: string;
      borrow_id: string;
      master_name: string;
      order_no: string;
      expected_return_date: string;
    }>;

    const result: BorrowConflict[] = [];
    const moldMap = new Map<string, BorrowConflict>();

    for (const row of conflicts) {
      if (!moldMap.has(row.mold_id)) {
        moldMap.set(row.mold_id, {
          moldId: row.mold_id,
          moldName: row.mold_name,
          conflicts: [],
        });
        result.push(moldMap.get(row.mold_id)!);
      }
      moldMap.get(row.mold_id)!.conflicts.push({
        borrowId: row.borrow_id,
        masterName: row.master_name,
        orderNo: row.order_no,
        expectedReturnDate: row.expected_return_date,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ error: '获取预约冲突失败' });
  }
});

router.get('/overdue', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT
        br.id,
        br.mold_id,
        m.name as mold_name,
        m.type as mold_type,
        m.size as mold_size,
        ma.name as master_name,
        br.order_no,
        br.borrow_date,
        br.expected_return_date,
        julianday('now') - julianday(br.expected_return_date) as overdue_days
      FROM borrow_records br
      JOIN molds m ON br.mold_id = m.id
      JOIN masters ma ON br.master_id = ma.id
      WHERE br.status = 'overdue'
      ORDER BY overdue_days DESC
    `).all();

    res.json(rows);
  } catch (error) {
    console.error('Get overdue error:', error);
    res.status(500).json({ error: '获取逾期列表失败' });
  }
});

router.get('/usage-by-size', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT
        m.type,
        m.size,
        COUNT(br.id) as borrow_count
      FROM molds m
      LEFT JOIN borrow_records br ON m.id = br.mold_id
      GROUP BY m.type, m.size
      ORDER BY borrow_count DESC
      LIMIT 10
    `).all() as Array<{
      type: string;
      size: string;
      borrow_count: number;
    }>;

    const usageBySize: UsageBySize[] = rows.map(row => ({
      type: row.type,
      size: row.size,
      borrowCount: row.borrow_count,
    }));

    res.json(usageBySize);
  } catch (error) {
    console.error('Get usage by size error:', error);
    res.status(500).json({ error: '获取使用统计失败' });
  }
});

router.get('/purchase-suggestions', (req: Request, res: Response) => {
  try {
    const db = getDb();

    const rows = db.prepare(`
      SELECT
        m.id as mold_id,
        m.name,
        m.type,
        m.size,
        m.quantity as current_quantity,
        m.available_quantity,
        COUNT(br.id) as borrow_count,
        (
          SELECT COUNT(*)
          FROM borrow_records br2
          WHERE br2.mold_id = m.id
          AND strftime('%Y-%m', br2.borrow_date) = strftime('%Y-%m', 'now')
        ) as monthly_usage
      FROM molds m
      LEFT JOIN borrow_records br ON m.id = br.mold_id
      GROUP BY m.id
      HAVING borrow_count > 0
      ORDER BY borrow_count DESC
    `).all() as Array<{
      mold_id: string;
      name: string;
      type: string;
      size: string;
      current_quantity: number;
      available_quantity: number;
      borrow_count: number;
      monthly_usage: number;
    }>;

    const suggestions: PurchaseSuggestion[] = rows
      .filter(row => {
        const usage = row.monthly_usage || 0;
        const needMore = usage > row.current_quantity * 0.7;
        const lowStock = row.available_quantity === 0;
        return needMore || lowStock;
      })
      .map(row => {
        const usage = row.monthly_usage || Math.ceil(row.borrow_count / 3);
        const suggestedQty = Math.max(
          Math.ceil(usage * 1.5),
          row.current_quantity + 2
        );
        const reasons: string[] = [];

        if (row.available_quantity === 0) {
          reasons.push('当前无可用库存');
        }
        if (usage > row.current_quantity * 0.7) {
          reasons.push(`月使用量(${usage})超过库存的70%`);
        }
        if (row.borrow_count > 5) {
          reasons.push(`累计借用${row.borrow_count}次，需求较高`);
        }

        return {
          moldId: row.mold_id,
          name: row.name,
          type: row.type,
          size: row.size,
          currentQuantity: row.current_quantity,
          suggestQuantity: suggestedQty,
          reason: reasons.join('；'),
        };
      });

    res.json(suggestions);
  } catch (error) {
    console.error('Get purchase suggestions error:', error);
    res.status(500).json({ error: '获取采购建议失败' });
  }
});

export default router;
