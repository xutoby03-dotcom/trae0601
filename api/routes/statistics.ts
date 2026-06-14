import { Router } from 'express';
import {
  getOverview,
  getUsageStats,
  getClubRankings,
  getMissingRateStats,
  getWashList,
  getRecentActivity,
} from '../services/statisticsService';

const router = Router();

router.get('/overview', (_req, res) => {
  try {
    const data = getOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/usage', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = getUsageStats(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/clubs', (_req, res) => {
  try {
    const data = getClubRankings();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/missing-rate', (_req, res) => {
  try {
    const data = getMissingRateStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/wash-list', (_req, res) => {
  try {
    const data = getWashList();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/recent', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = getRecentActivity(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
