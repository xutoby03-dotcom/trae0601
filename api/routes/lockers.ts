import express, { type Request, type Response } from 'express';
import {
  getAllLockers,
  getAvailableLockers,
  getLockerById,
  updateLockerStatus,
} from '../services/parcelService.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  const lockers = getAllLockers();
  const zones: Record<string, typeof lockers> = {};
  for (const l of lockers) {
    if (!zones[l.zone]) zones[l.zone] = [];
    zones[l.zone].push(l);
  }
  res.json({ success: true, data: lockers, zones });
});

router.get('/available', (_req: Request, res: Response) => {
  const lockers = getAvailableLockers();
  res.json({ success: true, data: lockers });
});

router.put('/:id', (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  if (!['free', 'occupied', 'disabled'].includes(status)) {
    return res.status(400).json({ success: false, error: '无效状态' });
  }
  const locker = getLockerById(req.params.id);
  if (locker) {
    updateLockerStatus(req.params.id, status);
    res.json({ success: true, data: { ...locker, status } });
  } else {
    res.status(404).json({ success: false, error: '柜格不存在' });
  }
});

export default router;
