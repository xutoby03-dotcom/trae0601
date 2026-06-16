import { Router, Request, Response } from 'express';
import { statisticsService } from '../services/statisticsService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const statistics = statisticsService.getOverallStatistics();
  res.json(statistics);
});

router.get('/course/:id', (req: Request, res: Response) => {
  const courseStats = statisticsService.getCourseStatistics(req.params.id);
  if (!courseStats) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(courseStats);
});

export default router;
