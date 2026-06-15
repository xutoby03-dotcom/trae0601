import { Router, Request, Response } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { building, search } = req.query;
    let sql = 'SELECT * FROM points WHERE 1=1';
    const params: any[] = [];

    if (building) {
      sql += ' AND building LIKE ?';
      params.push(`%${building}%`);
    }
    if (search) {
      sql += ' AND (building LIKE ? OR location LIKE ? OR supervisor LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const points = db.prepare(sql).all(...params) as any[];

    const result = points.map((point) => ({
      ...point,
      bin_types: JSON.parse(point.bin_types || '[]'),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取点位列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const point = db.prepare('SELECT * FROM points WHERE id = ?').get(id) as any;

    if (!point) {
      return res.status(404).json({ success: false, message: '点位不存在' });
    }

    point.bin_types = JSON.parse(point.bin_types || '[]');

    const recentInspections = db
      .prepare(
        'SELECT * FROM inspections WHERE point_id = ? ORDER BY inspection_time DESC LIMIT 10'
      )
      .all(id) as any[];

    const inspectionsWithTypes = recentInspections.map((inspection) => ({
      ...inspection,
      problem_types: JSON.parse(inspection.problem_types || '[]'),
      photos: JSON.parse(inspection.photos || '[]'),
    }));

    const openTickets = db
      .prepare("SELECT COUNT(*) as count FROM tickets WHERE point_id = ? AND status != 'closed'")
      .get(id) as { count: number };

    res.json({
      success: true,
      data: {
        ...point,
        recentInspections: inspectionsWithTypes,
        openTickets: openTickets.count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取点位详情失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { building, location, bin_types, open_hours, supervisor, camera_position, description } =
      req.body;

    if (!building) {
      return res.status(400).json({ success: false, message: '楼栋名称不能为空' });
    }

    const result = db
      .prepare(
        `INSERT INTO points (building, location, bin_types, open_hours, supervisor, camera_position, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        building,
        location || '',
        JSON.stringify(bin_types || []),
        open_hours || '',
        supervisor || '',
        camera_position || '',
        description || ''
      );

    const newPoint = db.prepare('SELECT * FROM points WHERE id = ?').get(result.lastInsertRowid) as any;
    newPoint.bin_types = JSON.parse(newPoint.bin_types || '[]');

    res.json({ success: true, data: newPoint });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建点位失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { building, location, bin_types, open_hours, supervisor, camera_position, description } =
      req.body;

    const existing = db.prepare('SELECT id FROM points WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '点位不存在' });
    }

    db.prepare(
      `UPDATE points SET building = ?, location = ?, bin_types = ?, open_hours = ?, 
       supervisor = ?, camera_position = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      building,
      location || '',
      JSON.stringify(bin_types || []),
      open_hours || '',
      supervisor || '',
      camera_position || '',
      description || '',
      id
    );

    const updatedPoint = db.prepare('SELECT * FROM points WHERE id = ?').get(id) as any;
    updatedPoint.bin_types = JSON.parse(updatedPoint.bin_types || '[]');

    res.json({ success: true, data: updatedPoint });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新点位失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM points WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '点位不存在' });
    }

    db.prepare('DELETE FROM tickets WHERE point_id = ?').run(id);
    db.prepare('DELETE FROM inspections WHERE point_id = ?').run(id);
    db.prepare('DELETE FROM points WHERE id = ?').run(id);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除点位失败' });
  }
});

export default router;
