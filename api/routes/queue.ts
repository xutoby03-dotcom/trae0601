import { Router } from 'express';
import { store } from '../store';
import type { QueueItem } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const queue = store.getQueue();
  res.json(queue);
});

router.post('/', (req, res) => {
  const data = req.body as Omit<QueueItem, 'id' | 'queueNumber' | 'status' | 'createdAt'>;
  
  if (!data.assistantId || !data.assistantName) {
    return res.status(400).json({ error: '请指定导购' });
  }

  if (data.itemsCount <= 0) {
    return res.status(400).json({ error: '拿入件数必须大于0' });
  }

  const newItem = store.addQueueItem(data);
  res.status(201).json(newItem);
});

router.put('/call-next', (req, res) => {
  const result = store.callNext();
  if (!result) {
    return res.status(400).json({ error: '没有等待的顾客或可用试衣间' });
  }
  res.json(result);
});

router.put('/:id/enter', (req, res) => {
  const { id } = req.params;
  const item = store.confirmEnter(id);
  
  if (!item) {
    return res.status(404).json({ error: '排队记录不存在或状态不正确' });
  }
  
  res.json(item);
});

router.put('/:id/complete', (req, res) => {
  const { id } = req.params;
  const recordData = req.body;
  
  const result = store.completeFitting(id, recordData);
  if (!result) {
    return res.status(404).json({ error: '排队记录不存在' });
  }
  
  res.json(result);
});

router.put('/:id/timeout', (req, res) => {
  const { id } = req.params;
  const item = store.markTimeout(id);
  
  if (!item) {
    return res.status(404).json({ error: '排队记录不存在或状态不正确' });
  }
  
  res.json(item);
});

router.get('/check-timeouts', (req, res) => {
  const timedOut = store.checkTimeouts();
  res.json({ timedOut });
});

export default router;
