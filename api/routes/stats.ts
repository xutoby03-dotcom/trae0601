import express, { type Request, type Response } from 'express';
import {
  getStatsSummary,
  getCompanyStats,
  getAbnormalRecords,
} from '../services/parcelService.js';

const router = express.Router();

router.get('/summary', (_req: Request, res: Response) => {
  const summary = getStatsSummary();
  res.json({ success: true, data: summary });
});

router.get('/by-company', (_req: Request, res: Response) => {
  const data = getCompanyStats();
  res.json({ success: true, data });
});

router.get('/abnormal', (_req: Request, res: Response) => {
  const records = getAbnormalRecords();
  res.json({ success: true, data: records });
});

export default router;
