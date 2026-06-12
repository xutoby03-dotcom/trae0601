import type { WaterChangeRecord, Observation, Reminder, Tank, Fish } from '@/types';

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function daysSince(dateStr: string): number {
  return daysBetween(dateStr, new Date().toISOString().split('T')[0]);
}

export function generateReminders(
  tank: Tank,
  waterChanges: WaterChangeRecord[],
  observations: Observation[],
  fishes: Fish[]
): Reminder[] {
  const reminders: Reminder[] = [];
  const today = new Date().toISOString().split('T')[0];

  const lastChangeDate = tank.lastWaterChange;
  const daysSinceChange = daysSince(lastChangeDate);
  if (daysSinceChange > tank.waterChangeInterval) {
    const overdueDays = daysSinceChange - tank.waterChangeInterval;
    reminders.push({
      id: 'reminder-water-overdue',
      type: 'water_change_overdue',
      title: '超期未换水',
      description: `已超期 ${overdueDays} 天，建议尽快换水 ${tank.waterChangeInterval}天/次`,
      level: overdueDays > 3 ? 'danger' : 'warning',
      days: overdueDays,
    });
  }

  if (waterChanges.length > 0) {
    const latestTemp = waterChanges[0].temperature;
    if (latestTemp < tank.minTemp || latestTemp > tank.maxTemp) {
      reminders.push({
        id: 'reminder-temp',
        type: 'temp_abnormal',
        title: '水温异常',
        description: `当前水温 ${latestTemp}°C，正常范围 ${tank.minTemp}-${tank.maxTemp}°C`,
        level: 'danger',
      });
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUnresolved = observations.filter(
    (obs) => new Date(obs.date) >= sevenDaysAgo && obs.status !== 'resolved'
  );
  if (recentUnresolved.length >= 3) {
    reminders.push({
      id: 'reminder-consecutive',
      type: 'consecutive_issues',
      title: '连续异常观察',
      description: `近7天有 ${recentUnresolved.length} 条未解决的异常，需重点关注`,
      level: 'danger',
    });
  }

  const sickFishes = fishes.filter((f) => f.status === 'sick' || f.status === 'quarantine');
  sickFishes.forEach((fish) => {
    reminders.push({
      id: `reminder-fish-${fish.id}`,
      type: 'sick_fish',
      title: `${fish.name} 状态异常`,
      description: `${fish.species}，状态：${fish.status === 'sick' ? '生病' : '隔离中'}`,
      level: fish.status === 'sick' ? 'danger' : 'warning',
    });
  });

  return reminders.sort((a, b) => {
    if (a.level === 'danger' && b.level === 'warning') return -1;
    if (a.level === 'warning' && b.level === 'danger') return 1;
    return 0;
  });
}

export interface MonthlyStats {
  month: string;
  count: number;
}

export function getMonthlyWaterChanges(records: WaterChangeRecord[]): MonthlyStats[] {
  const monthMap = new Map<string, number>();

  records.forEach((r) => {
    const date = new Date(r.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  });

  const sortedMonths = Array.from(monthMap.keys()).sort();
  return sortedMonths.map((month) => ({
    month,
    count: monthMap.get(month) || 0,
  }));
}

export interface WaterQualityPoint {
  date: string;
  temperature: number;
  ph: number;
}

export function getWaterQualityTrend(records: WaterChangeRecord[]): WaterQualityPoint[] {
  return [...records]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((r) => ({
      date: r.date.slice(5),
      temperature: r.temperature,
      ph: r.ph,
    }));
}

export interface FishIssueCount {
  fishId: string;
  fishName: string;
  avatar: string;
  count: number;
}

export function getMostProblematicFish(
  observations: Observation[],
  fishes: Fish[]
): FishIssueCount[] {
  const fishCount = new Map<string, number>();

  observations
    .filter((obs) => obs.targetType === 'fish' && obs.targetId)
    .forEach((obs) => {
      const id = obs.targetId!;
      fishCount.set(id, (fishCount.get(id) || 0) + 1);
    });

  const result: FishIssueCount[] = [];
  fishCount.forEach((count, fishId) => {
    const fish = fishes.find((f) => f.id === fishId);
    if (fish) {
      result.push({
        fishId,
        fishName: fish.name,
        avatar: fish.avatar,
        count,
      });
    }
  });

  return result.sort((a, b) => b.count - a.count);
}

export function calculatePhStats(records: WaterChangeRecord[]): {
  avg: number;
  min: number;
  max: number;
  range: number;
} {
  if (records.length === 0) {
    return { avg: 0, min: 0, max: 0, range: 0 };
  }
  const phValues = records.map((r) => r.ph);
  const min = Math.min(...phValues);
  const max = Math.max(...phValues);
  const avg = phValues.reduce((a, b) => a + b, 0) / phValues.length;
  return {
    avg: Math.round(avg * 10) / 10,
    min,
    max,
    range: Math.round((max - min) * 10) / 10,
  };
}
