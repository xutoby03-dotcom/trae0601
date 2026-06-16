import { Router, type Request, type Response } from 'express';
import db from '../db.js';

const router = Router();

router.post('/games/:id/check', (req: Request, res: Response): void => {
  const { type, table_location } = req.body;
  const gameId = Number(req.params.id);

  if (!type || !['open', 'close'].includes(type)) {
    res.status(400).json({ success: false, error: 'Invalid or missing type. Must be "open" or "close"' });
    return;
  }

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  const transaction = db.transaction(() => {
    const sessionResult = db.prepare(
      'INSERT INTO check_sessions (game_id, type, status, table_location) VALUES (?, ?, ?, ?)'
    ).run(gameId, type, 'in_progress', table_location || null);

    const sessionId = sessionResult.lastInsertRowid as number;

    const components = db.prepare('SELECT * FROM components WHERE game_id = ?').all(gameId) as any[];
    const insertItem = db.prepare(
      'INSERT INTO check_items (session_id, component_id, actual_count, is_missing, missing_count) VALUES (?, ?, ?, ?, ?)'
    );

    for (const comp of components) {
      insertItem.run(sessionId, comp.id, 0, 0, 0);
    }

    return sessionId;
  });

  const sessionId = transaction();
  const session = db.prepare('SELECT * FROM check_sessions WHERE id = ?').get(sessionId) as any;
  const items = db.prepare('SELECT * FROM check_items WHERE session_id = ?').all(sessionId);

  res.status(201).json({ success: true, data: { ...session, items } });
});

router.put('/check-sessions/:id/items', (req: Request, res: Response): void => {
  const sessionId = Number(req.params.id);
  const { items } = req.body;

  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, error: 'Items must be an array' });
    return;
  }

  const session = db.prepare('SELECT * FROM check_sessions WHERE id = ?').get(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: 'Check session not found' });
    return;
  }

  const transaction = db.transaction(() => {
    const updateItem = db.prepare(
      'UPDATE check_items SET actual_count = ?, is_missing = ?, missing_count = ?, possible_holder = ? WHERE session_id = ? AND component_id = ?'
    );

    for (const item of items) {
      updateItem.run(
        item.actual_count ?? 0,
        item.is_missing ? 1 : 0,
        item.missing_count ?? 0,
        item.possible_holder || null,
        sessionId,
        item.component_id
      );
    }
  });

  transaction();

  const updatedItems = db.prepare('SELECT * FROM check_items WHERE session_id = ?').all(sessionId);
  res.json({ success: true, data: updatedItems });
});

router.post('/check-sessions/:id/complete', (req: Request, res: Response): void => {
  const sessionId = Number(req.params.id);

  const session = db.prepare('SELECT * FROM check_sessions WHERE id = ?').get(sessionId) as any;
  if (!session) {
    res.status(404).json({ success: false, error: 'Check session not found' });
    return;
  }

  if (session.status === 'completed') {
    res.status(400).json({ success: false, error: 'Session already completed' });
    return;
  }

  const transaction = db.transaction(() => {
    db.prepare(
      "UPDATE check_sessions SET status = 'completed', completed_at = datetime('now') WHERE id = ?"
    ).run(sessionId);

    const missingItems = db.prepare(
      'SELECT COUNT(*) as count FROM check_items WHERE session_id = ? AND is_missing = 1'
    ).get(sessionId) as { count: number };

    if (missingItems.count > 0) {
      db.prepare("UPDATE games SET status = 'missing', updated_at = datetime('now') WHERE id = ?").run(session.game_id);
    } else {
      db.prepare("UPDATE games SET status = 'complete', updated_at = datetime('now') WHERE id = ?").run(session.game_id);
    }
  });

  transaction();

  const updatedSession = db.prepare('SELECT * FROM check_sessions WHERE id = ?').get(sessionId) as any;
  const items = db.prepare('SELECT * FROM check_items WHERE session_id = ?').all(sessionId);

  res.json({ success: true, data: { ...updatedSession, items } });
});

router.get('/games/:id/check-history', (req: Request, res: Response): void => {
  const gameId = Number(req.params.id);

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  const sessions = db.prepare('SELECT * FROM check_sessions WHERE game_id = ? ORDER BY created_at DESC').all(gameId) as any[];

  const sessionsWithItems = sessions.map((session) => {
    const items = db.prepare('SELECT * FROM check_items WHERE session_id = ?').all(session.id);
    return { ...session, items };
  });

  res.json({ success: true, data: sessionsWithItems });
});

export default router;
