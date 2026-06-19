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
  const registrations = store.getRegistrations(session.id).filter(r => r.status !== 'released');
  const regCodes = registrations.map(r => ({
    id: r.id,
    name: r.name,
    code: `CINE_${session.id}_${r.id}_${r.phone.slice(-4)}`,
    checkinUrl: `/checkin?sessionId=${session.id}&regId=${r.id}`,
  }));
  res.json({
    sessionId: session.id,
    title: session.title,
    date: session.date,
    time: session.time,
    venue: session.venue,
    checkinUrl: `/checkin?sessionId=${session.id}`,
    masterCode: `CINE_MASTER_${session.id}_${Date.now().toString(36)}`,
    registrations: regCodes,
  });
});

router.get('/registration-qrcode/:registrationId', (req, res) => {
  const reg = store.getRegistrations().find(r => r.id === req.params.registrationId);
  if (!reg) {
    res.status(404).json({ error: '报名记录不存在' });
    return;
  }
  const session = store.getSession(reg.sessionId);
  const code = `CINE_${reg.sessionId}_${reg.id}_${reg.phone.slice(-4)}`;
  res.json({
    code,
    registrationId: reg.id,
    sessionId: reg.sessionId,
    name: reg.name,
    peopleCount: reg.peopleCount,
    area: reg.area,
    sessionTitle: session?.title,
    sessionDate: session?.date,
    sessionTime: session?.time,
    venue: session?.venue,
    checkinUrl: `/checkin?sessionId=${reg.sessionId}&regId=${reg.id}&code=${encodeURIComponent(code)}`,
  });
});

router.get('/verify-code', (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) {
    res.status(400).json({ error: '缺少签到码' });
    return;
  }
  const parts = code.split('_');
  if (parts.length < 4 || parts[0] !== 'CINE') {
    res.status(400).json({ valid: false, error: '无效签到码格式' });
    return;
  }
  const sessionId = parts[1];
  const regId = parts[2];
  const reg = store.getRegistrations().find(r => r.id === regId && r.sessionId === sessionId);
  if (!reg) {
    res.status(404).json({ valid: false, error: '未找到对应报名记录' });
    return;
  }
  res.json({
    valid: true,
    registration: reg,
    session: store.getSession(sessionId),
  });
});

export default router;
