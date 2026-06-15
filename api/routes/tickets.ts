import { Router, Request, Response } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, priority, point_id, assignee } = req.query;
    let sql = `SELECT t.*, p.building, p.location 
               FROM tickets t 
               LEFT JOIN points p ON t.point_id = p.id 
               WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }
    if (point_id) {
      sql += ' AND t.point_id = ?';
      params.push(point_id);
    }
    if (assignee) {
      sql += ' AND t.assignee = ?';
      params.push(assignee);
    }
    sql += ' ORDER BY t.created_at DESC';

    const tickets = db.prepare(sql).all(...params) as any[];

    const result = tickets.map((ticket) => ({
      ...ticket,
      repair_photos: JSON.parse(ticket.repair_photos || '[]'),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取工单列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = db
      .prepare(
        `SELECT t.*, p.building, p.location, p.supervisor,
                i.inspector, i.inspection_time, i.problem_types as inspection_problems, i.photos as inspection_photos
         FROM tickets t 
         LEFT JOIN points p ON t.point_id = p.id 
         LEFT JOIN inspections i ON t.inspection_id = i.id
         WHERE t.id = ?`
      )
      .get(id) as any;

    if (!ticket) {
      return res.status(404).json({ success: false, message: '工单不存在' });
    }

    ticket.repair_photos = JSON.parse(ticket.repair_photos || '[]');
    ticket.inspection_problems = ticket.inspection_problems
      ? JSON.parse(ticket.inspection_problems)
      : [];
    ticket.inspection_photos = ticket.inspection_photos ? JSON.parse(ticket.inspection_photos) : [];

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取工单详情失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { inspection_id, point_id, title, description, priority, assignee } = req.body;

    if (!point_id || !title) {
      return res.status(400).json({ success: false, message: '请填写必要信息' });
    }

    const result = db
      .prepare(
        `INSERT INTO tickets (inspection_id, point_id, title, description, priority, status, assignee, assigned_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
      )
      .run(
        inspection_id || null,
        point_id,
        title,
        description || '',
        priority || 'medium',
        assignee || null,
        assignee ? new Date().toISOString() : null
      );

    const newTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid) as any;
    newTicket.repair_photos = JSON.parse(newTicket.repair_photos || '[]');

    if (inspection_id) {
      db.prepare('UPDATE inspections SET is_serious = 1 WHERE id = ?').run(inspection_id);
    }

    res.json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建工单失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, assignee } = req.body;

    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ success: false, message: '工单不存在' });
    }

    let assignedAt = existing.assigned_at;
    if (assignee && assignee !== existing.assignee) {
      assignedAt = new Date().toISOString();
    }

    let statusUpdate = '';
    const statusParams: any[] = [];

    if (status === 'processing' && existing.status === 'pending') {
      statusUpdate = ', assigned_at = COALESCE(assigned_at, ?)';
      statusParams.push(new Date().toISOString());
    }

    db.prepare(
      `UPDATE tickets SET title = ?, description = ?, priority = ?, status = ?, assignee = ?${statusUpdate}
       WHERE id = ?`
    ).run(title, description || '', priority || 'medium', status || existing.status, assignee || null, ...statusParams, id);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    updatedTicket.repair_photos = JSON.parse(updatedTicket.repair_photos || '[]');

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新工单失败' });
  }
});

router.post('/:id/resolve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { repair_photos, repair_notes } = req.body;

    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '工单不存在' });
    }

    db.prepare(
      `UPDATE tickets SET status = 'resolved', repair_photos = ?, repair_notes = ?, resolved_at = ?
       WHERE id = ?`
    ).run(JSON.stringify(repair_photos || []), repair_notes || '', new Date().toISOString(), id);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as any;
    updatedTicket.repair_photos = JSON.parse(updatedTicket.repair_photos || '[]');

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: '提交整改失败' });
  }
});

router.post('/:id/close', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '工单不存在' });
    }

    db.prepare(`UPDATE tickets SET status = 'closed', closed_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      id
    );

    res.json({ success: true, message: '工单已关闭' });
  } catch (error) {
    res.status(500).json({ success: false, message: '关闭工单失败' });
  }
});

export default router;
