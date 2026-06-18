import type { CoffeeBatch, BrewingRecord, Statistics, RestockItem } from '../types';
import { daysSince, addDays, getTodayISO } from './dateUtils';
import { getBatchStatus } from './statusUtils';

const RESTOCK_DAYS_THRESHOLD = 7;
const DEFAULT_RESTOCK_AMOUNT = 200;

export function calculateDailyRate(batch: CoffeeBatch, records: BrewingRecord[]): number {
  if (!batch.openDate) return 0;

  const daysOpen = daysSince(batch.openDate);
  if (daysOpen === 0) return 0;

  const totalConsumed = batch.initialWeight - batch.currentWeight;
  if (totalConsumed <= 0) return 0;

  return totalConsumed / daysOpen;
}

export function calculateAvgRating(batchId: string, records: BrewingRecord[]): number | null {
  const batchRecords = records.filter(r => r.batchId === batchId && r.rating !== null);
  if (batchRecords.length === 0) return null;

  const sum = batchRecords.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / batchRecords.length) * 10) / 10;
}

export function calculateWastedAmount(batches: CoffeeBatch[], records: BrewingRecord[]): number {
  let wasted = 0;

  batches.forEach(batch => {
    const status = getBatchStatus(batch);
    if (status === 'expired' && batch.currentWeight > 0) {
      wasted += batch.currentWeight;
    }
  });

  return wasted;
}

export function generateRestockSuggestions(
  batches: CoffeeBatch[],
  records: BrewingRecord[]
): RestockItem[] {
  const suggestions: RestockItem[] = [];

  batches.forEach(batch => {
    if (!batch.openDate) return;
    if (batch.currentWeight <= 0) return;

    const dailyRate = calculateDailyRate(batch, records);
    if (dailyRate <= 0) return;

    const daysLeft = batch.currentWeight / dailyRate;
    const estimatedEmptyDate = addDays(getTodayISO(), Math.ceil(daysLeft));

    if (daysLeft <= RESTOCK_DAYS_THRESHOLD) {
      suggestions.push({
        batchId: batch.id,
        origin: batch.origin,
        currentWeight: batch.currentWeight,
        dailyRate,
        estimatedEmptyDate,
        suggestedAmount: DEFAULT_RESTOCK_AMOUNT,
      });
    }
  });

  suggestions.sort((a, b) => a.dailyRate - b.dailyRate);
  return suggestions;
}

export function computeStatistics(
  batches: CoffeeBatch[],
  records: BrewingRecord[]
): Statistics {
  const totalBatches = batches.length;

  const restingCount = batches.filter(b => {
    const status = getBatchStatus(b);
    return status === 'resting';
  }).length;

  const expiringSoon = batches.filter(b => {
    if (!b.openDate) return false;
    const status = getBatchStatus(b);
    return status === 'declining' || status === 'expired';
  }).length;

  const totalConsumed = batches.reduce((sum, b) => {
    return sum + (b.initialWeight - b.currentWeight);
  }, 0);

  const totalWasted = calculateWastedAmount(batches, records);

  const consumptionRates = batches
    .filter(b => b.openDate)
    .map(b => ({
      batchId: b.id,
      origin: b.origin,
      rate: Math.round(calculateDailyRate(b, records) * 10) / 10,
    }))
    .sort((a, b) => b.rate - a.rate);

  const avgRatings = batches
    .map(b => {
      const batchRecords = records.filter(r => r.batchId === b.id && r.rating !== null);
      const avg = calculateAvgRating(b.id, records);
      return {
        batchId: b.id,
        origin: b.origin,
        avgRating: avg || 0,
        count: batchRecords.length,
      };
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.avgRating - a.avgRating);

  const restockSuggestions = generateRestockSuggestions(batches, records);

  return {
    totalBatches,
    restingCount,
    expiringSoon,
    totalConsumed,
    totalWasted,
    consumptionRates,
    avgRatings,
    restockSuggestions,
  };
}
