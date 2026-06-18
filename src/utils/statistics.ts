import type { Feedback, Seat, Floor, Statistics } from '@/types';

export function calculateTopZones(feedbacks: Feedback[]): { zone: string; count: number }[] {
  const zoneCount: Record<string, number> = {};
  feedbacks.forEach((f) => {
    const key = `${f.floor}楼${f.zone}区`;
    zoneCount[key] = (zoneCount[key] || 0) + 1;
  });
  return Object.entries(zoneCount)
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function calculateAvgHandleTime(feedbacks: Feedback[]): number {
  const handled = feedbacks.filter((f) => f.status !== 'pending' && f.handleTime);
  if (handled.length === 0) return 0;

  const totalMinutes = handled.reduce((sum, f) => {
    if (!f.handleTime) return sum;
    const submit = new Date(f.submitTime).getTime();
    const handle = new Date(f.handleTime).getTime();
    return sum + (handle - submit) / (1000 * 60);
  }, 0);

  return Math.round(totalMinutes / handled.length);
}

export function calculateRepeatReporters(feedbacks: Feedback[]): { id: string; name: string; count: number }[] {
  const reporterCount: Record<string, { name: string; count: number }> = {};
  feedbacks.forEach((f) => {
    if (!reporterCount[f.reporterId]) {
      reporterCount[f.reporterId] = { name: f.reporterName, count: 0 };
    }
    reporterCount[f.reporterId].count++;
  });
  return Object.entries(reporterCount)
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .filter((r) => r.count >= 2)
    .sort((a, b) => b.count - a.count);
}

export function calculateFreeSeatsByFloor(seats: Seat[]): { floor: number; count: number }[] {
  const result: { floor: number; count: number }[] = [];
  for (let f = 1; f <= 3; f++) {
    const floorSeats = seats.filter((s) => s.floor === f);
    const freeCount = floorSeats.filter((s) => !s.isOccupied).length;
    result.push({ floor: f, count: freeCount });
  }
  return result;
}

export function calculateQuietPeriods(feedbacks: Feedback[]): { day: number; hour: number; score: number }[][] {
  const matrix: number[][] = Array(7)
    .fill(null)
    .map(() => Array(24).fill(0));

  feedbacks.forEach((f) => {
    const date = new Date(f.occurTime);
    const day = date.getDay();
    const hour = date.getHours();
    if (hour >= 8 && hour < 22) {
      matrix[day][hour]++;
    }
  });

  const maxCount = Math.max(...matrix.flat(), 1);

  return matrix.map((row, day) =>
    row.map((count, hour) => ({
      day,
      hour,
      score: Math.max(0, 100 - Math.round((count / maxCount) * 100)),
    }))
  );
}

export function calculateHandleTimeTrend(feedbacks: Feedback[]): { date: string; avgMinutes: number }[] {
  const last7Days: Record<string, { total: number; count: number }> = {};
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last7Days[key] = { total: 0, count: 0 };
  }

  feedbacks.forEach((f) => {
    if (f.status !== 'pending' && f.handleTime) {
      const dayKey = f.submitTime.split('T')[0];
      if (last7Days[dayKey]) {
        const submit = new Date(f.submitTime).getTime();
        const handle = new Date(f.handleTime).getTime();
        const minutes = (handle - submit) / (1000 * 60);
        last7Days[dayKey].total += minutes;
        last7Days[dayKey].count++;
      }
    }
  });

  return Object.entries(last7Days).map(([date, data]) => ({
    date: date.slice(5),
    avgMinutes: data.count > 0 ? Math.round(data.total / data.count) : 0,
  }));
}

export function calculateAllStatistics(feedbacks: Feedback[], seats: Seat[]): Statistics {
  return {
    topZones: calculateTopZones(feedbacks),
    avgHandleTime: calculateAvgHandleTime(feedbacks),
    repeatReporters: calculateRepeatReporters(feedbacks),
    freeSeatsByFloor: calculateFreeSeatsByFloor(seats),
    quietestPeriods: calculateQuietPeriods(feedbacks),
  };
}
