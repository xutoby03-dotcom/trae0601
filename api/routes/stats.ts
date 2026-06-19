import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/conversion', (req, res) => {
  const period = (req.query.period as 'today' | 'week' | 'month') || 'today';
  const stats = store.getConversionStats(period);
  res.json(stats);
});

export default router;
