import type { Specimen } from '../types/specimen';
import { daysSince, addDays, formatDate } from './date';

const DRYING_DAYS_BASE = 14;
const DRYNESS_PER_PAPER_CHANGE = 12;
const DRYNESS_PER_DAY_BASE = 4;
const PLATE_WEIGHT_OPTIMAL = 5;

export function calculateDryness(specimen: Specimen): number {
  const daysPressed = daysSince(specimen.pressingDate);
  const paperChanges = specimen.paperChangeCount;

  const weightFactor = Math.min(specimen.plateWeight / PLATE_WEIGHT_OPTIMAL, 1.5);
  const dailyDryness = daysPressed * DRYNESS_PER_DAY_BASE * weightFactor;
  const paperDryness = paperChanges * DRYNESS_PER_PAPER_CHANGE;

  const intervalFactor = specimen.paperChangeIntervalDays <= 2 ? 1.15 : 1;
  const totalDryness = (dailyDryness + paperDryness) * intervalFactor;

  return Math.min(Math.round(totalDryness), 100);
}

export function getEstimatedCompletionDays(specimen: Specimen): number {
  const currentDryness = calculateDryness(specimen);
  if (currentDryness >= 100) return 0;

  const remainingDryness = 100 - currentDryness;
  const weightFactor = Math.min(specimen.plateWeight / PLATE_WEIGHT_OPTIMAL, 1.5);
  const dailyGain = DRYNESS_PER_DAY_BASE * weightFactor;

  return Math.ceil(remainingDryness / dailyGain);
}

export function needsPaperChange(specimen: Specimen): boolean {
  if (specimen.isCompleted) return false;
  const daysSinceLastChange = daysSince(specimen.lastPaperChangeDate);
  return daysSinceLastChange >= specimen.paperChangeIntervalDays;
}

export function getNextPaperChangeDate(specimen: Specimen): string | null {
  if (specimen.isCompleted) return null;
  const referenceDate = specimen.paperChangeCount > 0 ? specimen.lastPaperChangeDate : specimen.pressingDate;
  return addDays(referenceDate, specimen.paperChangeIntervalDays);
}

export function getNextPaperChangeInfo(specimen: Specimen): {
  dateStr: string | null;
  daysUntil: number;
  isOverdue: boolean;
  overdueDays: number;
} {
  if (specimen.isCompleted) {
    return { dateStr: null, daysUntil: 0, isOverdue: false, overdueDays: 0 };
  }
  const nextDate = getNextPaperChangeDate(specimen);
  if (!nextDate) {
    return { dateStr: null, daysUntil: 0, isOverdue: false, overdueDays: 0 };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextDate);
  next.setHours(0, 0, 0, 0);
  const diffMs = next.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntil < 0;
  const overdueDays = isOverdue ? Math.abs(daysUntil) : 0;
  return {
    dateStr: formatDate(nextDate),
    daysUntil,
    isOverdue,
    overdueDays,
  };
}
