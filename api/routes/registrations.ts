import { Router } from 'express';
import { store } from '../store';
import type { Registration } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const sessionId = req.query.sessionId as string | undefined;
  res.json(store.getRegistrations(sessionId));
});

router.post('/', (req, res) => {
  const body = req.body as Omit<Registration, 'id' | 'registeredAt' | 'status' | 'area'>;
  if (!body.sessionId || !body.name || !body.phone || !body.peopleCount) {
    res.status(400).json({ error: '场次、姓名、手机号、人数为必填项' });
    return;
  }
  const reg = store.addRegistration(body);
  res.status(201).json(reg);
});

export default router;
