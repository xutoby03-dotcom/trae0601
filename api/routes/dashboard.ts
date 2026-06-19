import { Router } from 'express';
import * as planController from '../controllers/planController.js';

const router = Router();

router.get('/stats', planController.getDashboardStats);

export default router;
