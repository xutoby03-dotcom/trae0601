import { OdorDescription, StorageType, MotherStarter, FeedingRecord } from '@/types';

export function calculateActivityScore(
  riseMultiplier: number,
  peakTime: number,
  odor: OdorDescription,
  temperature: number
): number {
  const riseScore = riseMultiplier >= 2 && riseMultiplier <= 3
    ? 40
    : Math.max(0, 40 - Math.abs(riseMultiplier - 2.5) * 20);

  const peakScore = peakTime >= 4 && peakTime <= 6
    ? 30
    : Math.max(0, 30 - Math.abs(peakTime - 5) * 10);

  const odorScores: Record<OdorDescription, number> = {
    fruity: 20,
    bready: 18,
    vinegar: 15,
    cheesy: 10,
    alcohol: 8,
    putrid: 0
  };
  const odorScore = odorScores[odor] || 10;

  const tempScore = temperature >= 24 && temperature <= 26
    ? 10
    : Math.max(0, 10 - Math.abs(temperature - 25) * 2);

  return Math.round(riseScore + peakScore + odorScore + tempScore);
}

export function calculateWeightAfterFeeding(
  currentWeight: number,
  discardAmount: number,
  flourAdded: number,
  waterAdded: number
): number {
  return currentWeight - discardAmount + flourAdded + waterAdded;
}

export function deductUsageWeight(
  weight: number,
  usageAmount: number
): number {
  return weight - usageAmount;
}

export function getNextFeedingTime(
  lastFedAt: string,
  feedingInterval: number,
  storageType: StorageType
): Date {
  const lastFed = new Date(lastFedAt);
  const interval = storageType === StorageType.REFRIGERATED
    ? feedingInterval * 24
    : feedingInterval;
  return new Date(lastFed.getTime() + interval * 60 * 60 * 1000);
}

export function isFeedingDue(
  starter: MotherStarter,
  now: Date = new Date()
): { dueAt: Date; overdue: boolean } | null {
  if (!starter.lastFedAt) {
    return { dueAt: now, overdue: true };
  }
  const dueAt = getNextFeedingTime(
    starter.lastFedAt,
    starter.feedingInterval,
    starter.storageType
  );
  return {
    dueAt,
    overdue: now > dueAt
  };
}

export function getActivityScoreColor(score: number): string {
  if (score >= 80) return '#52C41A';
  if (score >= 60) return '#FA8C16';
  return '#F5222D';
}

export function getActivityScoreLabel(score: number): string {
  if (score >= 90) return '极佳';
  if (score >= 80) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 60) return '一般';
  if (score >= 40) return '较差';
  return '异常';
}
