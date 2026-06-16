import { Router, type Request, type Response } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  const missingGames = db.prepare(`
    SELECT DISTINCT g.*, COALESCE(mc.missing_count, 0) as missing_count FROM games g
    LEFT JOIN (
      SELECT cs.game_id, SUM(ci.missing_count) as missing_count
      FROM check_items ci
      JOIN check_sessions cs ON ci.session_id = cs.id
      WHERE ci.is_missing = 1
      GROUP BY cs.game_id
    ) mc ON g.id = mc.game_id
    WHERE g.status = 'missing'
  `).all();

  const overdueLendings = db.prepare(`
    SELECT l.*, g.name as game_name FROM lendings l
    JOIN games g ON l.game_id = g.id
    WHERE l.status = 'active' AND l.return_date < date('now')
    ORDER BY l.return_date ASC
  `).all();

  const topPlayedGames = db.prepare(`
    SELECT g.*, COUNT(cs.id) as play_count
    FROM games g
    JOIN check_sessions cs ON g.id = cs.game_id
    WHERE cs.type = 'close' AND cs.status = 'completed'
      AND cs.created_at >= datetime('now', '-30 days')
    GROUP BY g.id
    ORDER BY play_count DESC
    LIMIT 3
  `).all();

  res.json({
    success: true,
    data: {
      missingGames,
      overdueLendings,
      topPlayedGames,
    },
  });
});

export default router;
