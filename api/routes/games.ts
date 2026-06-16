import { Router, type Request, type Response } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  const { status } = req.query;
  let games;

  if (status && typeof status === 'string') {
    games = db.prepare('SELECT * FROM games WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    games = db.prepare('SELECT * FROM games ORDER BY created_at DESC').all();
  }

  res.json({ success: true, data: games });
});

router.get('/:id', (req: Request, res: Response): void => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id) as any;

  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  const components = db.prepare('SELECT * FROM components WHERE game_id = ?').all(req.params.id);
  const expansions = db.prepare('SELECT * FROM expansions WHERE game_id = ?').all(req.params.id);

  res.json({ success: true, data: { ...game, components, expansions } });
});

router.post('/', (req: Request, res: Response): void => {
  const { name, min_players, max_players, play_time_minutes, status, components, expansions } = req.body;

  if (!name || min_players == null || max_players == null || play_time_minutes == null) {
    res.status(400).json({ success: false, error: 'Missing required fields: name, min_players, max_players, play_time_minutes' });
    return;
  }

  const transaction = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO games (name, min_players, max_players, play_time_minutes, status) VALUES (?, ?, ?, ?, ?)'
    ).run(name, min_players, max_players, play_time_minutes, status || 'complete');

    const gameId = result.lastInsertRowid as number;

    if (Array.isArray(expansions)) {
      const insertExpansion = db.prepare('INSERT INTO expansions (game_id, name) VALUES (?, ?)');
      for (const exp of expansions) {
        insertExpansion.run(gameId, exp.name);
      }
    }

    if (Array.isArray(components)) {
      const insertComponent = db.prepare('INSERT INTO components (game_id, name, category, expected_count) VALUES (?, ?, ?, ?)');
      for (const comp of components) {
        insertComponent.run(gameId, comp.name, comp.category, comp.expected_count ?? 1);
      }
    }

    return gameId;
  });

  const gameId = transaction();
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);

  res.status(201).json({ success: true, data: game });
});

router.put('/:id', (req: Request, res: Response): void => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);

  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  const { name, min_players, max_players, play_time_minutes, status } = req.body;

  db.prepare(
    `UPDATE games SET name = ?, min_players = ?, max_players = ?, play_time_minutes = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    name ?? (game as any).name,
    min_players ?? (game as any).min_players,
    max_players ?? (game as any).max_players,
    play_time_minutes ?? (game as any).play_time_minutes,
    status ?? (game as any).status,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response): void => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);

  if (!game) {
    res.status(404).json({ success: false, error: 'Game not found' });
    return;
  }

  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ success: true, data: { id: Number(req.params.id) } });
});

export default router;
