import { Router } from 'express';
import * as statsService from '../services/statsService.js';

const router = Router();

router.get('/', (_req, res) => {
  const stats = statsService.getStats();
  res.json(stats);
});

router.get('/peak-hours', (_req, res) => {
  const stats = statsService.getStats();
  res.json(stats.peakHours);
});

router.get('/popular-tables', (_req, res) => {
  const stats = statsService.getStats();
  res.json(stats.popularTables);
});

export default router;
