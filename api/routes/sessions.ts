import { Router } from 'express';
import { store } from '../store';
import type { Session } from '../../shared/types';

const router = Router();

router.get('/', (_req, res) => {
  res.json(store.getSessions());
});

router.get('/:id', (req, res) => {
  const session = store.getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: '场次不存在' });
    return;
  }
  res.json(session);
});

router.post('/', (req, res) => {
  const body = req.body as Omit<Session, 'id' | 'createdAt' | 'status'>;
  if (!body.title || !body.date || !body.venue) {
    res.status(400).json({ error: '片名、日期、场地为必填项' });
    return;
  }
  const session = store.addSession(body);
  res.status(201).json(session);
});

router.put('/:id', (req, res) => {
  const updated = store.updateSession(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: '场次不存在' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = store.deleteSession(req.params.id);
  if (!ok) {
    res.status(404).json({ error: '场次不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
