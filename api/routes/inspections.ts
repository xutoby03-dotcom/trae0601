import { Router, Request, Response } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { point_id, is_serious, search, limit, offset } = req.query;
    let sql = `SELECT i.*, p.building, p.location 
               FROM inspections i 
               LEFT JOIN points p ON i.point_id = p.id 
               WHERE 1=1`;
    const params: any[] = [];

    if (point_id) {
      sql += ' AND i.point_id = ?';
      params.push(point_id);
    }
    if (is_serious !== undefined) {
      sql += ' AND i.is_serious = ?';
      params.push(is_serious === 'true' || is_serious === '1' ? 1 : 0);
    }
    if (search) {
      sql += ' AND (i.notes LIKE ? OR p.building LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY i.inspection_time DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }
    if (offset) {
      sql += ' OFFSET ?';
      params.push(Number(offset));
    }

    const inspections = db.prepare(sql).all(...params) as any[];

    const result = inspections.map((inspection) => ({
      ...inspection,
      problem_types: JSON.parse(inspection.problem_types || '[]'),
      photos: JSON.parse(inspection.photos || '[]'),
    }));

    const countSql = sql.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as count FROM').replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '').replace(/OFFSET.*$/, '');
    const totalResult = db.prepare(countSql).get(...params.slice(0, params.length - (limit ? (offset ? 2 : 1) : 0))) as { count: number };

    res.json({ success: true, data: result, total: totalResult.count });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取巡查记录失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inspection = db
      .prepare(
        `SELECT i.*, p.building, p.location, p.supervisor 
         FROM inspections i 
         LEFT JOIN points p ON i.point_id = p.id 
         WHERE i.id = ?`
      )
      .get(id) as any;

    if (!inspection) {
      return res.status(404).json({ success: false, message: '巡查记录不存在' });
    }

    inspection.problem_types = JSON.parse(inspection.problem_types || '[]');
    inspection.photos = JSON.parse(inspection.photos || '[]');

    const ticket = db.prepare('SELECT * FROM tickets WHERE inspection_id = ?').get(id) as any;
    if (ticket) {
      ticket.repair_photos = JSON.parse(ticket.repair_photos || '[]');
    }

    res.json({ success: true, data: { ...inspection, ticket } });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取巡查详情失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { point_id, inspector, inspection_time, problem_types, photos, notes, is_serious } =
      req.body;

    if (!point_id || !inspector || !inspection_time || !problem_types?.length) {
      return res.status(400).json({ success: false, message: '请填写必要信息' });
    }

    const result = db
      .prepare(
        `INSERT INTO inspections (point_id, inspector, inspection_time, problem_types, photos, notes, is_serious)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        point_id,
        inspector,
        inspection_time,
        JSON.stringify(problem_types),
        JSON.stringify(photos || []),
        notes || '',
        is_serious ? 1 : 0
      );

    const newInspection = db.prepare('SELECT * FROM inspections WHERE id = ?').get(result.lastInsertRowid) as any;
    newInspection.problem_types = JSON.parse(newInspection.problem_types || '[]');
    newInspection.photos = JSON.parse(newInspection.photos || '[]');

    let createdTicket: any = null;
    if (is_serious) {
      const point = db.prepare('SELECT building, location, supervisor FROM points WHERE id = ?').get(point_id) as any;
      const problemList = problem_types.join('、');
      const buildingName = point?.building || '';

      const ticketResult = db
        .prepare(
          `INSERT INTO tickets (inspection_id, point_id, title, description, priority, status, assignee, created_at, assigned_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          newInspection.id,
          point_id,
          `${buildingName}存在${problemList}问题`,
          `巡查发现${buildingName}${point?.location ? '（' + point.location + '）' : ''}投放点存在${problemList}问题，请及时整改。`,
          problem_types.includes('满溢') ? 'high' : 'medium',
          'pending',
          '物业处理',
          new Date().toISOString(),
          new Date().toISOString()
        );

      createdTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketResult.lastInsertRowid) as any;
      if (createdTicket) {
        createdTicket.repair_photos = JSON.parse(createdTicket.repair_photos || '[]');
      }
    }

    res.json({ success: true, data: { ...newInspection, ticket: createdTicket } });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建巡查记录失败' });
  }
});

export default router;
