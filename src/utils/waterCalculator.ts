import { WaterStatus, DailyWaterStats, WaterRecord, PetProfile, LocationChangePoint, LocationChangeComparison } from '@/types';

export const WATER_PER_KG = 50;

export function calculateReferenceWater(weight: number, coefficient: number = 1.0): number {
  return Math.round(weight * WATER_PER_KG * coefficient);
}

export function calculateWaterConsumed(waterAdded: number, waterRemaining: number): number {
  return Math.max(0, waterAdded - waterRemaining);
}

export function calculateStatus(
  waterConsumed: number,
  referenceWater: number
): WaterStatus {
  if (referenceWater <= 0) return 'normal';
  
  const ratio = waterConsumed / referenceWater;
  
  if (ratio < 0.8) return 'low';
  if (ratio > 1.2) return 'high';
  return 'normal';
}

export function isConsecutiveAbnormal(stats: DailyWaterStats[], days: number = 3): boolean {
  if (stats.length < days) return false;
  
  const recentDays = stats.slice(-days);
  return recentDays.every(s => s.status === 'low' || s.status === 'high');
}

export function getStatusLabel(status: WaterStatus): string {
  const labels: Record<WaterStatus, string> = {
    normal: '正常',
    low: '偏少',
    high: '偏多',
    consecutive_abnormal: '连续异常',
  };
  return labels[status];
}

export function getStatusColor(status: WaterStatus): string {
  const colors: Record<WaterStatus, string> = {
    normal: 'text-success-600',
    low: 'text-warning-600',
    high: 'text-danger-600',
    consecutive_abnormal: 'text-danger-600',
  };
  return colors[status];
}

export function getStatusBgColor(status: WaterStatus): string {
  const colors: Record<WaterStatus, string> = {
    normal: 'bg-success-100',
    low: 'bg-warning-100',
    high: 'bg-danger-100',
    consecutive_abnormal: 'bg-danger-100',
  };
  return colors[status];
}

export function getBarColor(status: WaterStatus): string {
  const colors: Record<WaterStatus, string> = {
    normal: '#22c55e',
    low: '#f59e0b',
    high: '#ef4444',
    consecutive_abnormal: '#ef4444',
  };
  return colors[status];
}

export function buildDailyStats(
  records: WaterRecord[],
  pet: PetProfile
): DailyWaterStats[] {
  const referenceWater = calculateReferenceWater(pet.weight, pet.waterBaseCoefficient);
  
  const statsMap = new Map<string, DailyWaterStats>();
  
  records.forEach(record => {
    const waterConsumed = calculateWaterConsumed(record.waterAdded, record.waterRemaining);
    const baseStatus = calculateStatus(waterConsumed, referenceWater);
    
    statsMap.set(record.date, {
      date: record.date,
      waterConsumed,
      referenceWater,
      status: baseStatus,
      urineClumps: record.urineClumps,
      fountainOn: record.fountainOn,
      bowlLocation: record.bowlLocation,
    });
  });
  
  const stats = Array.from(statsMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  for (let i = 0; i < stats.length; i++) {
    if (i >= 2) {
      const lastThree = stats.slice(i - 2, i + 1);
      if (lastThree.every(s => s.status === 'low' || s.status === 'high')) {
        stats[i].status = 'consecutive_abnormal';
      }
    }
    if (i > 0 && stats[i].bowlLocation && stats[i - 1].bowlLocation && stats[i].bowlLocation !== stats[i - 1].bowlLocation) {
      stats[i].locationChanged = true;
      stats[i].previousLocation = stats[i - 1].bowlLocation;
    }
  }
  
  return stats;
}

export function getLocationComparison(
  stats: DailyWaterStats[],
  locationA: string,
  locationB: string
): { locationA: DailyWaterStats[]; locationB: DailyWaterStats[] } {
  return {
    locationA: stats.filter(s => s.bowlLocation === locationA),
    locationB: stats.filter(s => s.bowlLocation === locationB),
  };
}

export function calculateAverageWater(stats: DailyWaterStats[]): number {
  if (stats.length === 0) return 0;
  const total = stats.reduce((sum, s) => sum + s.waterConsumed, 0);
  return Math.round(total / stats.length);
}

export function findLocationChangePoints(stats: DailyWaterStats[]): LocationChangePoint[] {
  const points: LocationChangePoint[] = [];
  for (let i = 1; i < stats.length; i++) {
    const curr = stats[i];
    const prev = stats[i - 1];
    if (curr.bowlLocation && prev.bowlLocation && curr.bowlLocation !== prev.bowlLocation) {
      points.push({
        date: curr.date,
        fromLocation: prev.bowlLocation,
        toLocation: curr.bowlLocation,
        index: i,
      });
    }
  }
  return points;
}

export function buildLocationChangeComparison(
  stats: DailyWaterStats[],
  changePoint: LocationChangePoint
): LocationChangeComparison {
  const before7Days = stats.slice(Math.max(0, changePoint.index - 7), changePoint.index);
  const after7Days = stats.slice(changePoint.index, Math.min(stats.length, changePoint.index + 8));
  
  const beforeAvg = calculateAverageWater(before7Days);
  const afterAvg = calculateAverageWater(after7Days);
  const diffMl = afterAvg - beforeAvg;
  const diffPercent = beforeAvg > 0 ? Math.round((diffMl / beforeAvg) * 100) : 0;
  
  let betterLocation: string | null = null;
  if (beforeAvg > afterAvg * 1.05) {
    betterLocation = changePoint.fromLocation;
  } else if (afterAvg > beforeAvg * 1.05) {
    betterLocation = changePoint.toLocation;
  }
  
  return {
    changePoint,
    before7Days,
    after7Days,
    beforeAvg,
    afterAvg,
    beforeDays: before7Days.length,
    afterDays: after7Days.length,
    diffMl,
    diffPercent,
    betterLocation,
  };
}

export function getAllLocationChangeComparisons(
  stats: DailyWaterStats[]
): LocationChangeComparison[] {
  const points = findLocationChangePoints(stats);
  return points.map(p => buildLocationChangeComparison(stats, p));
}
