import { Router } from 'express';
import { seatService } from '../services/seatService';
import type { SeatRegistrationForm, SeatStatus } from '../types';

const router = Router();

router.get('/', (req, res) => {
  const { building, room } = req.query as { building?: string; room?: string };
  res.json(seatService.list(building, room));
});

router.get('/:id', (req, res) => {
  const seat = seatService.getById(req.params.id);
  if (!seat) return res.status(404).json({ error: '座位不存在' });
  res.json(seat);
});

router.post('/', (req, res) => {
  try {
    const form = req.body as SeatRegistrationForm;
    if (!form.building || !form.room || !form.seatNumber || !form.registeredBy || !form.contact || !form.expectedLeaveAt) {
      return res.status(400).json({ error: '请填写完整的登记信息' });
    }
    const seat = seatService.register(form);
    res.json(seat);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.patch('/:id', (req, res) => {
  const { status, tempLeaveMinutes, action } = req.body as {
    status?: SeatStatus;
    tempLeaveMinutes?: number;
    action?: 'temp_leave' | 'return' | 'release';
  };
  let seat;
  if (action === 'temp_leave' && tempLeaveMinutes) {
    seat = seatService.markTempLeave(req.params.id, tempLeaveMinutes);
  } else if (action === 'return') {
    seat = seatService.returnFromTemp(req.params.id);
  } else if (action === 'release') {
    seat = seatService.release(req.params.id);
  } else if (status) {
    seat = seatService.updateStatus(req.params.id, status);
  }
  if (!seat) return res.status(404).json({ error: '座位不存在' });
  res.json(seat);
});

router.delete('/:id', (req, res) => {
  const seat = seatService.release(req.params.id);
  if (!seat) return res.status(404).json({ error: '座位不存在' });
  res.json(seat);
});

export default router;
