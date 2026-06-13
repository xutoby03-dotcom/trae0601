import { Router } from 'express';
import { getSummary, getOverdue } from '../controllers/statisticsController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/overdue', getOverdue);

export default router;
