import { Router, Request, Response } from 'express';
import db from '../database.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { type, point_id, search } = req.query;
    let sql = 'SELECT * FROM promotions WHERE 1=1';
    const params: any[] = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY date DESC';

    const promotions = db.prepare(sql).all(...params) as any[];

    const result = promotions.map((promo) => ({
      ...promo,
      related_points: JSON.parse(promo.related_points || '[]'),
      photos: JSON.parse(promo.photos || '[]'),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取宣传记录失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = db.prepare('SELECT * FROM promotions WHERE id = ?').get(id) as any;

    if (!promotion) {
      return res.status(404).json({ success: false, message: '宣传记录不存在' });
    }

    promotion.related_points = JSON.parse(promotion.related_points || '[]');
    promotion.photos = JSON.parse(promotion.photos || '[]');

    if (promotion.related_points.length > 0) {
      const placeholders = promotion.related_points.map(() => '?').join(',');
      const points = db
        .prepare(`SELECT id, building, location FROM points WHERE id IN (${placeholders})`)
        .all(...promotion.related_points) as any[];
      promotion.points_detail = points;
    } else {
      promotion.points_detail = [];
    }

    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取宣传详情失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, date, location, type, participants, related_points, content, photos } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: '请填写必要信息' });
    }

    const result = db
      .prepare(
        `INSERT INTO promotions (title, date, location, type, participants, related_points, content, photos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title,
        date,
        location || '',
        type || '',
        participants || 0,
        JSON.stringify(related_points || []),
        content || '',
        JSON.stringify(photos || [])
      );

    const newPromotion = db.prepare('SELECT * FROM promotions WHERE id = ?').get(result.lastInsertRowid) as any;
    newPromotion.related_points = JSON.parse(newPromotion.related_points || '[]');
    newPromotion.photos = JSON.parse(newPromotion.photos || '[]');

    res.json({ success: true, data: newPromotion });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建宣传记录失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, date, location, type, participants, related_points, content, photos } = req.body;

    const existing = db.prepare('SELECT id FROM promotions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '宣传记录不存在' });
    }

    db.prepare(
      `UPDATE promotions SET title = ?, date = ?, location = ?, type = ?, participants = ?, 
       related_points = ?, content = ?, photos = ? WHERE id = ?`
    ).run(
      title,
      date,
      location || '',
      type || '',
      participants || 0,
      JSON.stringify(related_points || []),
      content || '',
      JSON.stringify(photos || []),
      id
    );

    const updatedPromotion = db.prepare('SELECT * FROM promotions WHERE id = ?').get(id) as any;
    updatedPromotion.related_points = JSON.parse(updatedPromotion.related_points || '[]');
    updatedPromotion.photos = JSON.parse(updatedPromotion.photos || '[]');

    res.json({ success: true, data: updatedPromotion });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新宣传记录失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM promotions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: '宣传记录不存在' });
    }

    db.prepare('DELETE FROM promotions WHERE id = ?').run(id);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除宣传记录失败' });
  }
});

export default router;
