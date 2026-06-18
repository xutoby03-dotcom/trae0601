import express, { type Request, type Response } from 'express';
import {
  createPackage,
  getPackageById,
  getWaitingPackages,
  getOverduePackages,
  getPackagesByPhone,
  getPackageByTracking,
  pickupPackage,
  markAbnormal,
  getAllPackages,
  getPriorityScore,
  isOverdue,
} from '../services/parcelService.js';
import type { CreatePackagePayload, PickupPayload, Package } from '../../shared/types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const phone = req.query.phone as string | undefined;
  const tracking = req.query.tracking as string | undefined;
  let packages: Package[];
  if (status === 'waiting') {
    packages = getWaitingPackages();
  } else if (status === 'overdue') {
    packages = getOverduePackages();
  } else if (phone) {
    packages = getPackagesByPhone(phone);
  } else if (tracking) {
    const pkg = getPackageByTracking(tracking);
    packages = pkg ? [pkg] : [];
  } else {
    packages = getAllPackages();
  }
  packages.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  const enriched = packages.map(p => ({ ...p, isOverdue: isOverdue(p.createdAt) }));
  res.json({ success: true, data: enriched });
});

router.get('/overdue', (_req: Request, res: Response) => {
  const packages = getOverduePackages();
  res.json({ success: true, data: packages });
});

router.get('/:id', (req: Request, res: Response) => {
  const pkg = getPackageById(req.params.id);
  if (pkg) {
    res.json({ success: true, data: { ...pkg, isOverdue: isOverdue(pkg.createdAt) } });
  } else {
    res.status(404).json({ success: false, error: '包裹不存在' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const payload = req.body as CreatePackagePayload;
    if (!payload.recipientName || !payload.phoneLast4 || !payload.company ||
        !payload.trackingNumber || !payload.lockerId || !payload.size) {
      return res.status(400).json({ success: false, error: '必填字段缺失' });
    }
    if (!/^\d{4}$/.test(payload.phoneLast4)) {
      return res.status(400).json({ success: false, error: '手机号后四位必须为4位数字' });
    }
    const pkg = createPackage(payload);
    res.json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id/pickup', (req: Request, res: Response) => {
  try {
    const payload = req.body as PickupPayload;
    if (!payload.pickedBy) {
      return res.status(400).json({ success: false, error: '请填写取件人' });
    }
    if (payload.isProxy && (!payload.proxyName || !payload.proxyPhone)) {
      return res.status(400).json({ success: false, error: '代领需要填写代领人信息' });
    }
    const pkg = pickupPackage(req.params.id, payload);
    if (pkg) {
      res.json({ success: true, data: pkg });
    } else {
      res.status(404).json({ success: false, error: '包裹不存在' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id/abnormal', (req: Request, res: Response) => {
  try {
    const { reason, pickedBy } = req.body as { reason: string; pickedBy: string };
    if (!reason || !pickedBy) {
      return res.status(400).json({ success: false, error: '请填写异常原因和处理人' });
    }
    const pkg = markAbnormal(req.params.id, reason, pickedBy);
    if (pkg) {
      res.json({ success: true, data: pkg });
    } else {
      res.status(404).json({ success: false, error: '包裹不存在' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
