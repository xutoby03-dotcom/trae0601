import express, { type Request, type Response } from 'express';
import { guestsDB } from '../utils/data.js';
import type { GuestStatus } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { sessionId, status, search, isVIP } = req.query;
  
  let guests = guestsDB.getAll();
  
  if (sessionId) {
    guests = guests.filter(g => g.sessionId === sessionId);
  }
  
  if (status) {
    guests = guests.filter(g => g.status === status);
  }
  
  if (isVIP === 'true') {
    guests = guests.filter(g => g.isVIP);
  }
  
  if (search) {
    const searchLower = (search as string).toLowerCase();
    guests = guests.filter(g => 
      g.name.toLowerCase().includes(searchLower) ||
      g.phone.includes(search as string)
    );
  }
  
  res.json({ success: true, data: guests });
});

router.get('/:id', (req: Request, res: Response) => {
  const guest = guestsDB.getById(req.params.id);
  if (!guest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  res.json({ success: true, data: guest });
});

router.post('/', (req: Request, res: Response) => {
  const { name, source, relationship, sessionId, headcount, dietaryRestrictions, phone, isVIP, notes } = req.body;
  
  if (!name || !source || !relationship || !sessionId || !headcount || !phone) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }

  const newGuest = guestsDB.create({
    name,
    source,
    relationship,
    sessionId,
    headcount: Number(headcount),
    dietaryRestrictions: dietaryRestrictions || '无',
    phone,
    isConfirmed: false,
    isVIP: isVIP || false,
    status: 'invited' as GuestStatus,
    notes,
  });

  res.status(201).json({ success: true, data: newGuest });
});

router.put('/:id', (req: Request, res: Response) => {
  const updatedGuest = guestsDB.update(req.params.id, req.body);
  if (!updatedGuest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  res.json({ success: true, data: updatedGuest });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = guestsDB.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.patch('/:id/confirm', (req: Request, res: Response) => {
  const guest = guestsDB.update(req.params.id, {
    isConfirmed: true,
    status: 'confirmed' as GuestStatus,
    confirmedAt: new Date().toISOString(),
  });
  
  if (!guest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  
  res.json({ success: true, data: guest });
});

router.patch('/:id/checkin', (req: Request, res: Response) => {
  const guest = guestsDB.update(req.params.id, {
    status: 'checked_in' as GuestStatus,
    checkedInAt: new Date().toISOString(),
  });
  
  if (!guest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  
  res.json({ success: true, data: guest });
});

router.patch('/:id/checkout', (req: Request, res: Response) => {
  const guest = guestsDB.update(req.params.id, {
    status: 'left' as GuestStatus,
    leftAt: new Date().toISOString(),
  });
  
  if (!guest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  
  res.json({ success: true, data: guest });
});

router.patch('/:id/no-show', (req: Request, res: Response) => {
  const { reason } = req.body;
  
  const guest = guestsDB.update(req.params.id, {
    status: 'no_show' as GuestStatus,
    noShowReason: reason,
  });
  
  if (!guest) {
    return res.status(404).json({ success: false, error: '客户不存在' });
  }
  
  res.json({ success: true, data: guest });
});

export default router;
