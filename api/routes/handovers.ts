import { Router } from 'express';
import { readStore, writeStore, generateId } from '../store';
import type { Handover, DenominationItem } from '../../shared/types';
import { DENOMINATIONS } from '../../shared/types';

const router = Router();

function calculateActualAmount(denominations: DenominationItem[]): number {
  return denominations.reduce((sum, d) => sum + d.denomination * d.count, 0);
}

function isOnTime(handoverTime: string, scheduledTime: string, thresholdMin = 15): boolean {
  const actual = new Date(handoverTime).getTime();
  const scheduled = new Date(scheduledTime).getTime();
  return Math.abs(actual - scheduled) <= thresholdMin * 60 * 1000;
}

router.get('/', (req, res) => {
  const store = readStore();
  let handovers = [...store.handovers];

  if (req.query.registerId) {
    handovers = handovers.filter((h) => h.registerId === req.query.registerId);
  }
  if (req.query.shift) {
    handovers = handovers.filter((h) => h.shift === req.query.shift);
  }
  if (req.query.dateFrom) {
    handovers = handovers.filter((h) => h.shiftDate >= String(req.query.dateFrom));
  }
  if (req.query.dateTo) {
    handovers = handovers.filter((h) => h.shiftDate <= String(req.query.dateTo));
  }

  handovers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(handovers);
});

router.get('/recent', (_req, res) => {
  const store = readStore();
  const recent = [...store.handovers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  res.json(recent);
});

router.get('/:id', (req, res) => {
  const store = readStore();
  const handover = store.handovers.find((h) => h.id === req.params.id);
  if (!handover) {
    res.status(404).json({ error: '交接记录不存在' });
    return;
  }
  res.json(handover);
});

router.post('/', (req, res) => {
  const store = readStore();
  const register = store.registers.find((r) => r.id === req.body.registerId);
  if (!register) {
    res.status(404).json({ error: '收银台不存在' });
    return;
  }

  const denominations: DenominationItem[] = DENOMINATIONS.map((d) => {
    const found = (req.body.denominations || []).find(
      (item: DenominationItem) => item.denomination === d
    );
    return { denomination: d, count: found ? Number(found.count) : 0 };
  });

  const actualAmount = calculateActualAmount(denominations);
  const difference = Number((actualAmount - register.defaultAmount).toFixed(2));
  const handoverTime = req.body.handoverTime || new Date().toISOString();
  const scheduledTime = req.body.scheduledTime;

  let status: Handover['status'] = 'normal';
  if (difference !== 0) {
    status = Math.abs(difference) > register.threshold ? 'danger' : 'warning';
  }

  const now = new Date().toISOString();
  const newHandover: Handover = {
    id: generateId(),
    registerId: register.id,
    registerCode: register.code,
    shift: req.body.shift,
    shiftDate: req.body.shiftDate,
    defaultAmount: register.defaultAmount,
    denominations,
    actualAmount,
    difference,
    differenceReason: req.body.differenceReason,
    scanCodeStatus: req.body.scanCodeStatus,
    scanCodeNote: req.body.scanCodeNote,
    pendingItems: req.body.pendingItems || '无',
    handoverPerson: req.body.handoverPerson,
    handoverSignature: req.body.handoverSignature || '',
    successorPerson: req.body.successorPerson,
    successorSignature: req.body.successorSignature || '',
    handoverTime,
    scheduledTime,
    isOnTime: scheduledTime ? isOnTime(handoverTime, scheduledTime) : true,
    status,
    createdAt: now,
  };

  store.handovers.push(newHandover);
  writeStore(store);
  res.status(201).json(newHandover);
});

export default router;
