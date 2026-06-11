import { Router } from 'express';
import { disputeService } from '../services/disputeService';
import type { DisputeForm } from '../types';

const router = Router();

router.get('/', (req, res) => {
  const { status } = req.query as { status?: 'pending' | 'resolved' | 'rejected' };
  res.json(disputeService.list(status));
});

router.post('/', (req, res) => {
  const form = req.body as DisputeForm;
  if (!form.seatId || !form.reporterName) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  res.json(disputeService.create(form));
});

router.patch('/:id/resolve', (req, res) => {
  const { action, note } = req.body as { action: 'recover' | 'reject'; note?: string };
  if (!action || !['recover', 'reject'].includes(action)) {
    return res.status(400).json({ error: '操作类型不正确' });
  }
  const dispute = disputeService.resolve(req.params.id, action, note);
  if (!dispute) return res.status(404).json({ error: '争议不存在' });
  res.json(dispute);
});

export default router;
