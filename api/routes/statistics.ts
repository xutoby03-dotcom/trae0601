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

const DENOMS = [100, 50, 20, 10, 5, 1, 0.5, 0.1];

function getActualCountMap(
  denominations: { denomination: number; count: number }[]
): Record<number, number> {
  const map: Record<number, number> = {};
  for (const d of DENOMS) map[d] = 0;
  for (const item of denominations) {
    if (DENOMS.includes(item.denomination)) {
      map[item.denomination] = item.count;
    }
  }
  return map;
}

type HandoverLike = {
  id: string;
  registerId: string;
  defaultAmount: number;
  difference: number;
  denominations: { denomination: number; count: number }[];
  createdAt: string;
};

function buildBaselineMap(
  allHandovers: HandoverLike[]
): Map<string, Record<number, number>> {
  const map = new Map<string, Record<number, number>>();

  const balanced = allHandovers.filter((h) => Math.abs(h.difference) < 0.001);

  const registerIds = new Set(allHandovers.map((h) => h.registerId));

  for (const rid of registerIds) {
    const sameReg = balanced.filter((h) => h.registerId === rid);
    if (sameReg.length === 0) continue;

    const amounts = new Map<number, HandoverLike[]>();
    for (const h of sameReg) {
      const arr = amounts.get(h.defaultAmount) ?? [];
      arr.push(h);
      amounts.set(h.defaultAmount, arr);
    }

    for (const [amt, list] of amounts.entries()) {
      const baseline: Record<number, number> = {};
      for (const d of DENOMS) baseline[d] = 0;
      for (const h of list) {
        const cm = getActualCountMap(h.denominations);
        for (const d of DENOMS) baseline[d] += cm[d];
      }
      for (const d of DENOMS) {
        baseline[d] = Math.round(baseline[d] / list.length);
      }
      map.set(`${rid}:${amt}`, baseline);
    }
  }

  return map;
}

function hasBaseline(
  h: HandoverLike,
  baselineMap: Map<string, Record<number, number>>
): boolean {
  return baselineMap.has(`${h.registerId}:${h.defaultAmount}`);
}

function decomposeAmount(absDiff: number): number[] {
  const usedDenoms: number[] = [];
  let remaining = absDiff;

  for (const d of DENOMS) {
    while (remaining >= d - 0.001) {
      if (!usedDenoms.includes(d)) {
        usedDenoms.push(d);
      }
      remaining = Math.round((remaining - d) * 100) / 100;
    }
  }

  return usedDenoms;
}

function getDenominationStats(): DenominationStat[] {
  const store = readStore();
  const shortageMap: Record<number, number> = {};
  const surplusMap: Record<number, number> = {};
  for (const d of DENOMS) {
    shortageMap[d] = 0;
    surplusMap[d] = 0;
  }

  const baselineMap = buildBaselineMap(store.handovers);

  const diffHandovers = store.handovers.filter(
    (h) => Math.abs(h.difference) > 0.001
  );

  for (const h of diffHandovers) {
    const absDiff = Math.abs(h.difference);
    const isShortage = h.difference < 0;
    const targetMap = isShortage ? shortageMap : surplusMap;

    if (hasBaseline(h, baselineMap)) {
      const baseline = baselineMap.get(`${h.registerId}:${h.defaultAmount}`)!;
      const actual = getActualCountMap(h.denominations);
      let allocated = 0;

      if (isShortage) {
        for (let i = DENOMS.length - 1; i >= 0; i--) {
          const d = DENOMS[i];
          const gap = baseline[d] - actual[d];
          if (gap > 0) {
            targetMap[d]++;
            allocated += gap * d;
            if (allocated >= absDiff - 0.001) break;
          }
        }
        if (allocated < absDiff - 0.001) {
          const used = decomposeAmount(absDiff - allocated);
          for (const d of used) targetMap[d]++;
        }
      } else {
        for (let i = DENOMS.length - 1; i >= 0; i--) {
          const d = DENOMS[i];
          const excess = actual[d] - baseline[d];
          if (excess > 0) {
            targetMap[d]++;
            allocated += excess * d;
            if (allocated >= absDiff - 0.001) break;
          }
        }
        if (allocated < absDiff - 0.001) {
          const used = decomposeAmount(absDiff - allocated);
          for (const d of used) targetMap[d]++;
        }
      }
    } else {
      const usedDenoms = decomposeAmount(absDiff);
      for (const d of usedDenoms) {
        targetMap[d]++;
      }
    }
  }

  return DENOMS.map((d) => ({
    denomination: d,
    shortageCount: shortageMap[d],
    surplusCount: surplusMap[d],
  }));
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
