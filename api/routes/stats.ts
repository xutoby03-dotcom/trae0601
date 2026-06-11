import { Router } from 'express';
import { statsService } from '../services/statsService';

const router = Router();

router.get('/', (_req, res) => {
  res.json(statsService.get());
});

export default router;
