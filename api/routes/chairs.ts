import { Router } from 'express';
import { chairController } from '../controllers/ChairController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, chairController.getAllChairs.bind(chairController));
router.get('/available', authMiddleware, chairController.getAvailableChairs.bind(chairController));
router.get('/:id', authMiddleware, chairController.getChairById.bind(chairController));

export default router;
