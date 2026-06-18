import type { RecoveryPoint, SortingRecord, SortingItem, Exception } from '../types';

export const calculateCapacityRatio = (point: RecoveryPoint): number => {
  if (point.capacityKg === 0) return 0;
  return point.currentKg / point.capacityKg;
};

export const calculateStatus = (point: RecoveryPoint): RecoveryPoint['status'] => {
  const ratio = calculateCapacityRatio(point);
  if (point.status === 'exception') return 'exception';
  if (ratio >= 0.9) return 'full';
  if (ratio >= 0.7) return 'warning';
  return 'normal';
};

export const calculateTotalWeight = (items: SortingItem[]): number => {
  return items.reduce((sum, item) => sum + item.weightKg, 0);
};

export const calculateSortingRatio = (records: SortingRecord[]): Record<string, number> => {
  const allItems = records.flatMap(r => r.items);
  const total = calculateTotalWeight(allItems);
  if (total === 0) {
    return { donatable: 0, recyclable: 0, damaged: 0, needs_cleaning: 0 };
  }
  const byCategory: Record<string, number> = {
    donatable: 0, recyclable: 0, damaged: 0, needs_cleaning: 0,
  };
  allItems.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + item.weightKg;
  });
  return Object.fromEntries(
    Object.entries(byCategory).map(([k, v]) => [k, v / total])
  );
};

export const calculateDonatableRatio = (records: SortingRecord[]): number => {
  const ratios = calculateSortingRatio(records);
  return ratios.donatable || 0;
};

export const calculateCollectionEfficiency = (
  records: { collectionTime: string; createdAt: string }[]
): number => {
  if (records.length === 0) return 0;
  const totalHours = records.reduce((sum, r) => {
    const createdAt = new Date(r.createdAt);
    const collectionTime = new Date(r.collectionTime);
    const diffMs = collectionTime.getTime() - createdAt.getTime();
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);
  return totalHours / records.length;
};

export const calculateTimelyRate = (
  records: { collectionTime: string; createdAt: string }[]
): number => {
  if (records.length === 0) return 0;
  const timelyCount = records.filter(r => {
    const createdAt = new Date(r.createdAt);
    const collectionTime = new Date(r.collectionTime);
    const diffMs = collectionTime.getTime() - createdAt.getTime();
    return diffMs <= 24 * 60 * 60 * 1000;
  }).length;
  return timelyCount / records.length;
};

export const estimateBagWeight = (bagCount: number): number => {
  return bagCount * 5;
};
