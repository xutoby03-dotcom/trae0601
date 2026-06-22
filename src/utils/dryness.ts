import type { Specimen } from '../types/specimen';
import { daysSince } from './date';

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
