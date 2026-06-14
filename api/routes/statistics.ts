import { Router } from 'express';
import { readStore } from '../store';
import type {
  ShiftDifferenceStat,
  DenominationStat,
  PendingDifference,
  PunctualityDay,
  OverviewStats,
  StatsResponse,
} from '../../shared/types';

const router = Router();

function getOverviewStats(): OverviewStats {
  const store = readStore();
  const today = new Date().toISOString().split('T')[0];

  const todayHandovers = store.handovers.filter((h) => h.shiftDate === today).length;
  const pendingDifferences = store.handovers.filter(
    (h) => h.difference !== 0 && h.status !== 'normal'
  ).length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekHandovers = store.handovers.filter(
    (h) => new Date(h.createdAt) >= oneWeekAgo
  );
  const weeklyPunctuality =
    weekHandovers.length > 0
      ? Math.round(
          (weekHandovers.filter((h) => h.isOnTime).length / weekHandovers.length) * 100
        )
      : 100;

  return {
    todayHandovers,
    pendingDifferences,
    weeklyPunctuality,
    totalRegisters: store.registers.length,
  };
}

function getShiftDifferences(): ShiftDifferenceStat[] {
  const store = readStore();
  const result: ShiftDifferenceStat[] = [
    { shift: 'morning', count: 0, totalAmount: 0 },
    { shift: 'evening', count: 0, totalAmount: 0 },
  ];

  store.handovers.forEach((h) => {
    if (h.difference !== 0) {
      const item = result.find((r) => r.shift === h.shift);
      if (item) {
        item.count++;
        item.totalAmount += Math.abs(h.difference);
      }
    }
  });

  return result;
}

function getDenominationStats(): DenominationStat[] {
  const store = readStore();
  const denoms = [100, 50, 20, 10, 5, 1, 0.5, 0.1];

  return denoms.map((d) => {
    let shortageCount = 0;
    let surplusCount = 0;

    store.handovers.forEach((h) => {
      const denom = h.denominations.find((x) => x.denomination === d);
      if (!denom) return;
      const defaultCount = Math.floor(h.defaultAmount / (d * 8));
      if (denom.count < defaultCount) shortageCount++;
      else if (denom.count > defaultCount) surplusCount++;
    });

    return { denomination: d, shortageCount, surplusCount };
  });
}

function getPendingDifferences(): PendingDifference[] {
  const store = readStore();
  return store.handovers
    .filter((h) => h.difference !== 0 && h.status !== 'normal')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((h) => ({
      handoverId: h.id,
      registerCode: h.registerCode,
      amount: h.difference,
      date: h.shiftDate,
    }));
}

function getPunctualityRate(): PunctualityDay[] {
  const store = readStore();
  const days: PunctualityDay[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayHandovers = store.handovers.filter((h) => h.shiftDate === dateStr);
    const onTime = dayHandovers.filter((h) => h.isOnTime).length;
    days.push({
      date: dateStr,
      rate: dayHandovers.length > 0 ? Math.round((onTime / dayHandovers.length) * 100) : 100,
      total: dayHandovers.length,
      onTime,
    });
  }

  return days;
}

router.get('/overview', (_req, res) => {
  res.json(getOverviewStats());
});

router.get('/', (_req, res) => {
  const response: StatsResponse = {
    shiftDifferences: getShiftDifferences(),
    denominationStats: getDenominationStats(),
    pendingDifferences: getPendingDifferences(),
    punctualityRate: getPunctualityRate(),
    overview: getOverviewStats(),
  };
  res.json(response);
});

export default router;
