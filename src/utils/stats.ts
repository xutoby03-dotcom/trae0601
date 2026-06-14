import type { TastingRecord, Product, Order } from '@/types';
import { startOfDay, endOfDay, addDays } from './date';

export interface DailyStat {
  date: string;
  tastingCount: number;
  completedCount: number;
  totalPortion: number;
  wastedPortion: number;
  convertedOrders: number;
  conversionRate: number;
  wasteRate: number;
}

export interface ProductRank {
  productId: string;
  productName: string;
  tastingCount: number;
  convertedOrders: number;
  conversionRate: number;
  wasteRate: number;
  score: number;
}

export function calculateDailyStats(
  records: TastingRecord[],
  products: Product[],
  orders: Order[],
  days: number = 7
): DailyStat[] {
  const stats: DailyStat[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const dateStr = date.toISOString().split('T')[0];
    const startTs = startOfDay(date).getTime();
    const endTs = endOfDay(date).getTime();

    const dayRecords = records.filter((r) => {
      const t = new Date(r.startTime).getTime();
      return t >= startTs && t <= endTs;
    });

    const completedRecords = dayRecords.filter(
      (r) => r.status === 'completed' || r.status === 'expired'
    );

    const totalPortion = dayRecords.reduce((sum, r) => sum + r.portion, 0);
    const wastedPortion = completedRecords.reduce(
      (sum, r) => sum + r.remainingPortion,
      0
    );
    const convertedOrders = completedRecords.reduce(
      (sum, r) => sum + r.convertedOrders,
      0
    );

    const conversionRate = dayRecords.length > 0 ? convertedOrders / dayRecords.length : 0;
    const wasteRate = totalPortion > 0 ? wastedPortion / totalPortion : 0;

    stats.push({
      date: dateStr,
      tastingCount: dayRecords.length,
      completedCount: completedRecords.length,
      totalPortion: Number(totalPortion.toFixed(2)),
      wastedPortion: Number(wastedPortion.toFixed(2)),
      convertedOrders,
      conversionRate: Number(conversionRate.toFixed(2)),
      wasteRate: Number(wasteRate.toFixed(2)),
    });
  }

  return stats;
}

export function calculateProductRanking(
  records: TastingRecord[],
  products: Product[],
  batchesMap: Map<string, { productId: string }>
): ProductRank[] {
  const productMap = new Map<string, {
    productId: string;
    productName: string;
    tastingCount: number;
    convertedOrders: number;
    totalPortion: number;
    wastedPortion: number;
  }>();

  for (const record of records) {
    if (record.status === 'active') continue;
    
    const batch = batchesMap.get(record.batchId);
    if (!batch) continue;
    
    const product = products.find((p) => p.id === batch.productId);
    if (!product) continue;

    const existing = productMap.get(batch.productId) || {
      productId: batch.productId,
      productName: product.name,
      tastingCount: 0,
      convertedOrders: 0,
      totalPortion: 0,
      wastedPortion: 0,
    };

    existing.tastingCount++;
    existing.convertedOrders += record.convertedOrders;
    existing.totalPortion += record.portion;
    existing.wastedPortion += record.remainingPortion;

    productMap.set(batch.productId, existing);
  }

  const rankings: ProductRank[] = [];

  for (const item of productMap.values()) {
    const conversionRate = item.tastingCount > 0 ? item.convertedOrders / item.tastingCount : 0;
    const wasteRate = item.totalPortion > 0 ? item.wastedPortion / item.totalPortion : 0;
    const score = conversionRate * 0.7 + (1 - wasteRate) * 0.3;

    rankings.push({
      productId: item.productId,
      productName: item.productName,
      tastingCount: item.tastingCount,
      convertedOrders: item.convertedOrders,
      conversionRate: Number(conversionRate.toFixed(2)),
      wasteRate: Number(wasteRate.toFixed(2)),
      score: Number(score.toFixed(2)),
    });
  }

  return rankings.sort((a, b) => b.score - a.score);
}

export function getTotalWaste(records: TastingRecord[]): number {
  return records
    .filter((r) => r.status !== 'active')
    .reduce((sum, r) => sum + r.remainingPortion, 0);
}

export function getTodayWaste(records: TastingRecord[]): number {
  const todayStart = startOfDay(new Date()).getTime();
  const todayEnd = endOfDay(new Date()).getTime();
  
  return records
    .filter((r) => {
      if (r.status === 'active') return false;
      const endTime = r.actualEndTime ? new Date(r.actualEndTime).getTime() : 0;
      return endTime >= todayStart && endTime <= todayEnd;
    })
    .reduce((sum, r) => sum + r.remainingPortion, 0);
}
