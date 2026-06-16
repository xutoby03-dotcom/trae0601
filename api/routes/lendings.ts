import { Router, type Request, type Response } from 'express';
import db from '../db.js';

const router = Router();

router.post('/games/:id/lend', (req: Request, res: Response): void => {
  const gameId = Number(req.params.id);
  const { borrower_name, return_date, deposit } = req.body;

  if (!borrower_name || !return_date) {
    res.status(400).json({ success: false, error: 'Missing required fields: borrower_name, return_date' });
    return;
  }

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  const transaction = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO lendings (game_id, borrower_name, return_date, deposit, status) VALUES (?, ?, ?, ?, ?)'
    ).run(gameId, borrower_name, return_date, deposit || 0, 'active');

    db.prepare("UPDATE games SET status = 'lent', updated_at = datetime('now') WHERE id = ?").run(gameId);

    return result.lastInsertRowid as number;
  });

  const lendingId = transaction();
  const lending = db.prepare('SELECT * FROM lendings WHERE id = ?').get(lendingId);

  res.status(201).json({ success: true, data: lending });
});

router.put('/lendings/:id/return', (req: Request, res: Response): void => {
  const lendingId = Number(req.params.id);

  const lending = db.prepare('SELECT * FROM lendings WHERE id = ?').get(lendingId) as any;
  if (!lending) {
    res.status(404).json({ success: false, error: 'Lending not found' });
    return;
  }

  if (lending.status !== 'active') {
    res.status(400).json({ success: false, error: 'Lending is not active' });
    return;
  }

  const transaction = db.transaction(() => {
    db.prepare("UPDATE lendings SET status = 'returned', returned_at = datetime('now') WHERE id = ?").run(lendingId);

    const missingItems = db.prepare(
      'SELECT COUNT(*) as count FROM check_items ci JOIN check_sessions cs ON ci.session_id = cs.id WHERE cs.game_id = ? AND ci.is_missing = 1'
    ).get(lending.game_id) as { count: number };

    if (missingItems.count > 0) {
      db.prepare("UPDATE games SET status = 'missing', updated_at = datetime('now') WHERE id = ?").run(lending.game_id);
    } else {
      db.prepare("UPDATE games SET status = 'complete', updated_at = datetime('now') WHERE id = ?").run(lending.game_id);
    }
  });

  transaction();

  const updatedLending = db.prepare('SELECT * FROM lendings WHERE id = ?').get(lendingId);
  res.json({ success: true, data: updatedLending });
});

router.get('/lendings', (_req: Request, res: Response): void => {
  const lendings = db.prepare(
    'SELECT l.*, g.name as game_name FROM lendings l JOIN games g ON l.game_id = g.id ORDER BY l.lent_at DESC'
  ).all();

  res.json({ success: true, data: lendings });
});

router.get('/lendings/overdue', (_req: Request, res: Response): void => {
  const lendings = db.prepare(
    "SELECT l.*, g.name as game_name FROM lendings l JOIN games g ON l.game_id = g.id WHERE l.status = 'active' AND l.return_date < date('now') ORDER BY l.return_date ASC"
  ).all();

  res.json({ success: true, data: lendings });
});

export default router;
