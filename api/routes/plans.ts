import { Router } from 'express';
import * as planController from '../controllers/planController.js';

const router = Router();

router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);
router.post('/', planController.createPlan);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

router.post('/:id/dishes', planController.addDish);
router.put('/:id/dishes/:dishId', planController.updateDish);
router.delete('/:id/dishes/:dishId', planController.deleteDish);

router.get('/:id/seating', planController.getSeating);
router.post('/:id/seating', planController.generateSeating);
router.put('/:id/seating', planController.saveSeating);

router.get('/:id/conflicts', planController.getConflicts);

router.get('/:id/export/restaurant', planController.exportRestaurantList);
router.get('/:id/export/table-cards', planController.exportTableCards);

export default router;
