import express, { type Request, type Response } from 'express';
import { sessionsDB } from '../utils/data.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const sessions = sessionsDB.getAll();
  res.json({ success: true, data: sessions });
});

router.get('/:id', (req: Request, res: Response) => {
  const session = sessionsDB.getById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: '场次不存在' });
  }
  res.json({ success: true, data: session });
});

router.post('/', (req: Request, res: Response) => {
  const { name, date, startTime, endTime, capacity, description } = req.body;
  
  if (!name || !date || !startTime || !endTime || !capacity) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }

  const newSession = sessionsDB.create({
    name,
    date,
    startTime,
    endTime,
    capacity,
    description,
  });

  res.status(201).json({ success: true, data: newSession });
});

router.put('/:id', (req: Request, res: Response) => {
  const updatedSession = sessionsDB.update(req.params.id, req.body);
  if (!updatedSession) {
    return res.status(404).json({ success: false, error: '场次不存在' });
  }
  res.json({ success: true, data: updatedSession });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = sessionsDB.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: '场次不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

export default router;
