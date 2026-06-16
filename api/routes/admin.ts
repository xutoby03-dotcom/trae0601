import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats/usage', authMiddleware, adminMiddleware, adminController.getUsageStats.bind(adminController));
router.get('/stats/popular-times', authMiddleware, adminMiddleware, adminController.getPopularTimes.bind(adminController));
router.get('/stats/no-shows', authMiddleware, adminMiddleware, adminController.getNoShowList.bind(adminController));
router.get('/stats/damages', authMiddleware, adminMiddleware, adminController.getDamagePartStats.bind(adminController));
router.get('/stats/today', authMiddleware, adminMiddleware, adminController.getTodaySummary.bind(adminController));

export default router;
