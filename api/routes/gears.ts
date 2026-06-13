import { Router } from 'express';
import {
  getAllGears,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
  lendGear,
  returnGear,
} from '../controllers/gearController.js';

const router = Router();

router.get('/', getAllGears);
router.get('/:id', getGearById);
router.post('/', createGear);
router.put('/:id', updateGear);
router.delete('/:id', deleteGear);
router.post('/:id/lend', lendGear);
router.post('/:id/return', returnGear);

export default router;
