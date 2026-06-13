import { Router } from 'express';
import * as replenishmentController from '../controllers/replenishmentController';

const router = Router();

router.get('/', replenishmentController.getReplenishments);
router.get('/:id', replenishmentController.getReplenishment);
router.post('/', replenishmentController.createReplenishment);

export default router;
