import { Router } from 'express';
import * as statisticsController from '../controllers/statisticsController';

const router = Router();

router.get('/consumption-rate', statisticsController.getConsumptionRate);
router.get('/department-usage', statisticsController.getDepartmentUsage);
router.get('/replenishment-forecast', statisticsController.getReplenishmentForecast);
router.get('/daily-trend', statisticsController.getDailyTrend);

export default router;
