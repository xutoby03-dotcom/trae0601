import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.post('/:registrationId', (req, res) => {
  const reg = store.checkIn(req.params.registrationId);
  if (!reg) {
    res.status(404).json({ error: '报名记录不存在' });
    return;
  }
  res.json(reg);
});

router.post('/release/:id', (req, res) => {
  const reg = store.releaseSeat(req.params.id);
  if (!reg) {
    res.status(404).json({ error: '报名记录不存在' });
    return;
  }
  res.json(reg);
});

router.get('/qrcode/:sessionId', (req, res) => {
  const session = store.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: '场次不存在' });
    return;
  }
  res.json({
    sessionId: session.id,
    title: session.title,
    date: session.date,
    time: session.time,
    venue: session.venue,
    checkinUrl: `/checkin?sessionId=${session.id}`,
  });
});

export default router;
