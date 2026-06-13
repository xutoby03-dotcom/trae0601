import { Router } from 'express';
import * as consumptionController from '../controllers/consumptionController';

const router = Router();

router.get('/', consumptionController.getConsumptions);
router.get('/:id', consumptionController.getConsumption);
router.post('/', consumptionController.createConsumption);

export default router;
