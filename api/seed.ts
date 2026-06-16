import db from './db.js';

function daysAgo(days: number, time: string = '19:00:00'): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10) + ' ' + time;
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const count = db.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };
if (count.count === 0) {
  const insertGame = db.prepare(`
    INSERT INTO games (name, min_players, max_players, play_time_minutes, status) VALUES (?, ?, ?, ?, ?)
  `);
  const insertExpansion = db.prepare(`INSERT INTO expansions (game_id, name) VALUES (?, ?)`);
  const insertComponent = db.prepare(`INSERT INTO components (game_id, name, category, expected_count) VALUES (?, ?, ?, ?)`);
  const insertCheckSession = db.prepare(`INSERT INTO check_sessions (game_id, type, status, table_location, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertLending = db.prepare(`INSERT INTO lendings (game_id, borrower_name, return_date, deposit, status, lent_at) VALUES (?, ?, ?, ?, ?, ?)`);

  const transaction = db.transaction(() => {
    const catanId = insertGame.run('卡坦岛', 3, 4, 60, 'complete').lastInsertRowid as number;
    insertExpansion.run(catanId, '海洋扩展');
    insertComponent.run(catanId, '资源卡', 'deck', 95);
    insertComponent.run(catanId, '发展卡', 'deck', 25);
    insertComponent.run(catanId, '六边形地形板块', 'piece', 19);
    insertComponent.run(catanId, '数字标识', 'piece', 18);
    insertComponent.run(catanId, '骰子', 'dice', 2);
    insertComponent.run(catanId, '说明书', 'manual', 1);
    insertComponent.run(catanId, '计分板', 'scoreboard', 1);
    insertComponent.run(catanId, '村庄', 'piece', 16);
    insertComponent.run(catanId, '道路', 'piece', 30);
    insertComponent.run(catanId, '城市', 'piece', 12);

    const carcassonneId = insertGame.run('卡卡颂', 2, 5, 45, 'missing').lastInsertRowid as number;
    insertExpansion.run(carcassonneId, '商人与建筑师');
    insertComponent.run(carcassonneId, '地形板块', 'deck', 72);
    insertComponent.run(carcassonneId, '随从米宝', 'piece', 40);
    insertComponent.run(carcassonneId, '骰子', 'dice', 0);
    insertComponent.run(carcassonneId, '说明书', 'manual', 1);
    insertComponent.run(carcassonneId, '计分板', 'scoreboard', 1);
    insertComponent.run(carcassonneId, '修道院指示物', 'piece', 6);

    const loveLetterId = insertGame.run('情书', 2, 4, 20, 'lent').lastInsertRowid as number;
    insertComponent.run(loveLetterId, '角色卡', 'deck', 16);
    insertComponent.run(loveLetterId, '骰子', 'dice', 0);
    insertComponent.run(loveLetterId, '说明书', 'manual', 1);
    insertComponent.run(loveLetterId, '好感标记', 'piece', 13);

    insertCheckSession.run(catanId, 'open', 'completed', '1号桌', daysAgo(5, '19:00:00'), daysAgo(5, '19:05:00'));
    insertCheckSession.run(catanId, 'close', 'completed', '1号桌', daysAgo(5, '21:30:00'), daysAgo(5, '21:35:00'));
    insertCheckSession.run(catanId, 'open', 'completed', '2号桌', daysAgo(3, '14:00:00'), daysAgo(3, '14:03:00'));
    insertCheckSession.run(catanId, 'close', 'completed', '2号桌', daysAgo(3, '16:30:00'), daysAgo(3, '16:33:00'));
    insertCheckSession.run(catanId, 'open', 'completed', '3号桌', daysAgo(1, '14:00:00'), daysAgo(1, '14:04:00'));
    insertCheckSession.run(catanId, 'close', 'completed', '3号桌', daysAgo(1, '15:54:00'), daysAgo(1, '15:57:00'));
    insertCheckSession.run(carcassonneId, 'open', 'completed', '1号桌', daysAgo(4, '19:00:00'), daysAgo(4, '19:03:00'));
    insertCheckSession.run(carcassonneId, 'close', 'completed', '1号桌', daysAgo(4, '20:30:00'), daysAgo(4, '20:35:00'));
    insertCheckSession.run(carcassonneId, 'open', 'completed', '2号桌', daysAgo(2, '15:00:00'), daysAgo(2, '15:03:00'));
    insertCheckSession.run(carcassonneId, 'close', 'completed', '2号桌', daysAgo(2, '16:30:00'), daysAgo(2, '16:35:00'));

    insertLending.run(loveLetterId, '小明', daysFromNow(7), 50, 'active', daysAgo(3, '15:00:00'));

    const carcassonneClose = db.prepare('SELECT id FROM check_sessions WHERE game_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1').get(carcassonneId, 'close') as any;
    const carcassonneComponents = db.prepare('SELECT * FROM components WHERE game_id = ?').all(carcassonneId) as any[];
    if (carcassonneClose && carcassonneComponents.length > 0) {
      const insertItem = db.prepare('INSERT INTO check_items (session_id, component_id, actual_count, is_missing, missing_count, possible_holder) VALUES (?, ?, ?, ?, ?, ?)');
      for (const comp of carcassonneComponents) {
        if (comp.category === 'piece') {
          insertItem.run(carcassonneClose.id, comp.id, comp.expected_count - 2, 1, 2, '可能掉在沙发底下');
        } else {
          insertItem.run(carcassonneClose.id, comp.id, comp.expected_count, 0, 0, null);
        }
      }
    }
  });

  transaction();
}
