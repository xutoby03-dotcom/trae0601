import type { Batch, Oven, LossStat, OvenUtilization } from '@/types';
import { isToday } from './time';

export function getLossRanking(batches: Batch[]): LossStat[] {
  const finished = batches.filter((b) => b.status === 'finished' && isToday(b.startTime));
  const map = new Map<string, { loss: number; total: number }>();
  for (const b of finished) {
    const entry = map.get(b.productName) || { loss: 0, total: 0 };
    entry.loss += b.lossQuantity || 0;
    entry.total += b.quantity;
    map.set(b.productName, entry);
  }
  const result: LossStat[] = [];
  for (const [productName, v] of map.entries()) {
    result.push({
      productName,
      lossQuantity: v.loss,
      totalQuantity: v.total,
      lossRate: v.total > 0 ? +(v.loss / v.total).toFixed(4) : 0,
    });
  }
  return result.sort((a, b) => b.lossQuantity - a.lossQuantity);
}

export function getAverageOvertime(batches: Batch[]): number {
  const finished = batches.filter(
    (b) => b.status === 'finished' && isToday(b.startTime) && b.actualDuration !== undefined
  );
  if (finished.length === 0) return 0;
  const total = finished.reduce((sum, b) => {
    const diff = (b.actualDuration || 0) - b.targetDuration / 60;
    return sum + Math.max(0, diff);
  }, 0);
  return +(total / finished.length).toFixed(1);
}

export function getOvenUtilizations(batches: Batch[], ovens: Oven[]): OvenUtilization[] {
  const WORK_HOURS = 12 * 60;
  const finished = batches.filter((b) => b.status === 'finished' && isToday(b.startTime));
  return ovens.map((oven) => {
    const total = finished
      .filter((b) => b.ovenId === oven.id)
      .reduce((sum, b) => sum + ((b.actualDuration || 0) * 60), 0);
    const minutes = Math.floor(total / 60);
    return {
      ovenId: oven.id,
      ovenName: oven.name,
      totalMinutes: minutes,
      utilizationRate: +(minutes / WORK_HOURS).toFixed(4),
    };
  });
}

export function getOverviewStats(batches: Batch[]) {
  const todayBatches = batches.filter((b) => isToday(b.startTime));
  const active = todayBatches.filter((b) => b.status === 'baking').length;
  const finished = todayBatches.filter((b) => b.status === 'finished');
  const totalQuantity = finished.reduce((s, b) => s + b.quantity, 0);
  const lossQuantity = finished.reduce((s, b) => s + (b.lossQuantity || 0), 0);
  const lossRate = totalQuantity > 0 ? lossQuantity / totalQuantity : 0;
  return {
    total: todayBatches.length,
    active,
    lossRate: +(lossRate * 100).toFixed(1),
    avgOvertime: getAverageOvertime(batches),
  };
}
