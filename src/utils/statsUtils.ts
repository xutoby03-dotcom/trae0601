import type {
  StoreStats,
  OverdueItem,
  DamageRateItem,
  DailyPeakItem,
  RecentActivity,
} from '../types';
import { useUmbrellaStore } from '../store/umbrellaStore';
import { useLendStore } from '../store/lendStore';
import { formatTime, getOverdueDays, isOverdue, timeAgo } from './dateUtils';

export function computeDashboardStats() {
  const { umbrellas } = useUmbrellaStore.getState();
  const { lendRecords, returnRecords } = useLendStore.getState();
  const returnedIds = new Set(returnRecords.map((r) => r.lendRecordId));
  const activeLends = lendRecords.filter((r) => !returnedIds.has(r.id));
  const overdueCount = activeLends.filter((r) => isOverdue(r.dueTime)).length;

  return {
    available: umbrellas.filter((u) => u.status === 'available').length,
    lent: umbrellas.filter((u) => u.status === 'lent').length,
    overdue: overdueCount,
    damaged: umbrellas.filter((u) => u.status === 'damaged').length,
    total: umbrellas.length,
  };
}

export function computeStoreStats(): StoreStats[] {
  const { stores, umbrellas } = useUmbrellaStore.getState();
  return stores.map((s) => {
    const items = umbrellas.filter((u) => u.storeId === s.id);
    return {
      storeId: s.id,
      storeName: s.name,
      available: items.filter((u) => u.status === 'available').length,
      lent: items.filter((u) => u.status === 'lent').length,
      damaged: items.filter((u) => u.status === 'damaged').length,
      total: items.length,
    };
  });
}

export function computeOverdueList(): OverdueItem[] {
  const { stores, umbrellas, getStoreName } = useUmbrellaStore.getState();
  const { lendRecords, returnRecords } = useLendStore.getState();
  const returnedIds = new Set(returnRecords.map((r) => r.lendRecordId));
  const umbrellaMap = new Map(umbrellas.map((u) => [u.id, u]));
  const storeMap = new Map(stores.map((s) => [s.id, s.name]));

  return lendRecords
    .filter((r) => !returnedIds.has(r.id))
    .map((r) => {
      const u = umbrellaMap.get(r.umbrellaId);
      const overdueDays = getOverdueDays(r.dueTime);
      return {
        lendRecordId: r.id,
        umbrellaId: r.umbrellaId,
        umbrellaCode: u?.code ?? '?',
        umbrellaPhoto: u?.photoUrl ?? '',
        phoneLast4: r.phoneLast4,
        lendTime: r.lendTime,
        dueTime: r.dueTime,
        overdueDays,
        lentStoreId: u?.storeId ?? '',
        lentStoreName: storeMap.get(u?.storeId ?? '') ?? '?',
        expectedStoreName: storeMap.get(r.expectedStoreId) ?? '?',
        reminded: !!r.reminded,
      };
    })
    .filter((x) => x.overdueDays > 0)
    .sort((a, b) => b.overdueDays - a.overdueDays);
}

export function computeDamageRate(): DamageRateItem[] {
  const { returnRecords } = useLendStore.getState();
  const byMonth: Record<string, { total: number; damaged: number }> = {};
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const now = new Date();
  const year = now.getFullYear();
  months.forEach((m) => (byMonth[`${year}-${m}`] = { total: 0, damaged: 0 }));

  returnRecords.forEach((r) => {
    const d = new Date(r.returnTime);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { total: 0, damaged: 0 };
    byMonth[key].total += 1;
    if (r.finalStatus === 'damaged') byMonth[key].damaged += 1;
  });

  return Object.entries(byMonth).map(([month, v]) => ({
    month: month.slice(5) + '月',
    rate: v.total === 0 ? 0 : Math.round((v.damaged / v.total) * 1000) / 10,
  }));
}

const RAINY_HOURS = [8, 9, 12, 13, 17, 18, 19];
const RANDOM_SEED = [12, 18, 24, 31, 22, 28, 35, 40, 29, 15, 20, 17, 9, 22, 33, 45, 52, 38, 25, 14, 8, 5, 3, 2];

function padHour(h: number): string {
  return h.toString().padStart(2, '0') + ':00';
}

export function computeRainyDayPeak(): DailyPeakItem[] {
  const arr: DailyPeakItem[] = [];
  for (let h = 6; h <= 22; h++) {
    const hourKey = padHour(h);
    const baseRainy = RAINY_HOURS.includes(h) ? 35 : 10;
    const rainy = Math.round(baseRainy + RANDOM_SEED[h % RANDOM_SEED.length] * 0.6);
    const normal = Math.round(baseRainy * 0.35);
    arr.push({ hour: hourKey, count: rainy, isRainyDay: true });
    arr.push({ hour: hourKey, count: normal, isRainyDay: false });
  }
  return arr;
}

export function computeRecentActivities(): RecentActivity[] {
  const { umbrellas } = useUmbrellaStore.getState();
  const { lendRecords, returnRecords } = useLendStore.getState();
  const uMap = new Map(umbrellas.map((u) => [u.id, u]));
  const list: Array<RecentActivity & { _ts: number }> = [];

  lendRecords.slice(0, 10).forEach((r) => {
    const u = uMap.get(r.umbrellaId);
    const od = getOverdueDays(r.dueTime);
    if (od > 0) {
      list.push({
        id: `od-${r.id}`,
        type: 'overdue',
        umbrellaCode: u?.code ?? '?',
        description: `顾客尾号${r.phoneLast4}已逾期${od}天未归还`,
        time: r.dueTime,
        _ts: new Date(r.dueTime).getTime(),
      });
    } else {
      list.push({
        id: `ld-${r.id}`,
        type: 'lend',
        umbrellaCode: u?.code ?? '?',
        description: `顾客尾号${r.phoneLast4}借出`,
        time: r.lendTime,
        _ts: new Date(r.lendTime).getTime(),
      });
    }
  });

  returnRecords.slice(0, 10).forEach((r) => {
    const lr = lendRecords.find((l) => l.id === r.lendRecordId);
    const u = lr ? uMap.get(lr.umbrellaId) : undefined;
    list.push({
      id: `rt-${r.id}`,
      type: r.finalStatus === 'damaged' ? 'damage' : 'return',
      umbrellaCode: u?.code ?? '?',
      description:
        r.finalStatus === 'damaged' ? `归还时检测到破损：${r.damageNote || '待处理'}` : '顾客归还，质检通过',
      time: r.returnTime,
      _ts: new Date(r.returnTime).getTime(),
    });
  });

  return list
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 10)
    .map(({ _ts, ...rest }) => ({ ...rest, time: timeAgo(rest.time) }));
}
