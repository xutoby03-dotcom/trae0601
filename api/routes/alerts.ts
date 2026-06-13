import { Router } from 'express';
import * as alertController from '../controllers/alertController';

const router = Router();

router.get('/', alertController.getAlerts);
router.put('/:id/resolve', alertController.resolveAlert);

export default router;
