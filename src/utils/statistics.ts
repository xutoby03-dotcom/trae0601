import dayjs from 'dayjs';
import type { Facility, Repair, Severity } from '@/types';
import { SEVERITY_CONFIG } from '@/types';

export const SEVERITY_ORDER: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function getPendingRepairsCount(repairs: Repair[]): number {
  return repairs.filter(r => r.status === 'pending' || r.status === 'assigned').length;
}

export function getCompletedRate(repairs: Repair[]): number {
  const now = dayjs();
  const startOfMonth = now.startOf('month');
  const monthRepairs = repairs.filter(r => dayjs(r.created_at).isAfter(startOfMonth));
  if (monthRepairs.length === 0) return 0;
  const completed = monthRepairs.filter(r => r.status === 'completed').length;
  return Math.round((completed / monthRepairs.length) * 100);
}

export function getAverageRepairDuration(repairs: Repair[]): number {
  const completed = repairs.filter(r => r.status === 'completed' && r.started_at && r.completed_at);
  if (completed.length === 0) return 0;
  const totalHours = completed.reduce((sum, r) => {
    const start = dayjs(r.started_at!);
    const end = dayjs(r.completed_at!);
    return sum + end.diff(start, 'hour', true);
  }, 0);
  return Math.round((totalHours / completed.length) * 10) / 10;
}

export interface UpcomingInspection {
  facility: Facility;
  nextDate: dayjs.Dayjs;
  daysLeft: number;
}

export function getUpcomingInspections(
  facilities: Facility[],
  days: number
): UpcomingInspection[] {
  const now = dayjs();
  const endDate = now.add(days, 'day');
  
  const result: UpcomingInspection[] = facilities
    .map(f => {
      const lastDate = f.last_inspection_date ? dayjs(f.last_inspection_date) : now.subtract(f.inspection_cycle_days, 'day');
      const nextDate = lastDate.add(f.inspection_cycle_days, 'day');
      const daysLeft = nextDate.diff(now, 'day');
      return { facility: f, nextDate, daysLeft };
    })
    .filter(item => item.nextDate.isBefore(endDate.add(1, 'day')) || item.daysLeft < 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  
  return result;
}

export interface RepeatFaultItem {
  facility: Facility;
  count: number;
  firstDate: dayjs.Dayjs;
  lastDate: dayjs.Dayjs;
}

export function getRepeatFaultFacilities(
  facilities: Facility[],
  repairs: Repair[],
  minCount: number = 2
): RepeatFaultItem[] {
  const facilityMap = new Map<string, RepeatFaultItem>();

  repairs.forEach(r => {
    const facility = facilities.find(f => f.id === r.facility_id);
    if (!facility) return;
    
    const created = dayjs(r.created_at);
    
    if (!facilityMap.has(facility.id)) {
      facilityMap.set(facility.id, {
        facility,
        count: 0,
        firstDate: created,
        lastDate: created,
      });
    }
    
    const item = facilityMap.get(facility.id)!;
    item.count += 1;
    if (created.isBefore(item.firstDate)) item.firstDate = created;
    if (created.isAfter(item.lastDate)) item.lastDate = created;
  });

  return Array.from(facilityMap.values())
    .filter(item => item.count >= minCount)
    .sort((a, b) => b.count - a.count);
}

export function getNextInspectionDate(facility: Facility): dayjs.Dayjs {
  const lastDate = facility.last_inspection_date
    ? dayjs(facility.last_inspection_date)
    : dayjs(facility.install_date);
  return lastDate.add(facility.inspection_cycle_days, 'day');
}

export function getInspectionDueInDays(facility: Facility): number {
  const nextDate = getNextInspectionDate(facility);
  return nextDate.diff(dayjs(), 'day');
}

export function getSeverityDistribution(repairs: Repair[]) {
  const result: Record<Severity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  repairs.forEach(r => {
    result[r.severity] += 1;
  });
  return result;
}

export function getPendingByFacility(
  facilities: Facility[],
  repairs: Repair[],
  topN: number = 10
) {
  const pending = repairs.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const map = new Map<string, { facility: Facility; count: number }>();
  
  pending.forEach(r => {
    const f = facilities.find(f => f.id === r.facility_id);
    if (!f) return;
    if (!map.has(f.id)) map.set(f.id, { facility: f, count: 0 });
    map.get(f.id)!.count += 1;
  });

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function getDurationTrend(repairs: Repair[], days: number = 30) {
  const now = dayjs();
  const startDate = now.subtract(days - 1, 'day').startOf('day');
  const result: { date: string; avgHours: number }[] = [];

  for (let i = 0; i < days; i++) {
    const day = startDate.add(i, 'day');
    const dayStr = day.format('MM-DD');
    const dayStart = day.startOf('day');
    const dayEnd = day.endOf('day');
    
    const dayCompleted = repairs.filter(r => {
      if (r.status !== 'completed' || !r.started_at || !r.completed_at) return false;
      const completedAt = dayjs(r.completed_at);
      return completedAt.isAfter(dayStart) && completedAt.isBefore(dayEnd);
    });

    let avgHours = 0;
    if (dayCompleted.length > 0) {
      const total = dayCompleted.reduce((sum, r) => {
        return sum + dayjs(r.completed_at!).diff(dayjs(r.started_at!), 'hour', true);
      }, 0);
      avgHours = Math.round((total / dayCompleted.length) * 10) / 10;
    }

    result.push({ date: dayStr, avgHours });
  }

  return result;
}

export interface ProblemTypeStats {
  type: string;
  avgHours: number;
  count: number;
}

export function getProblemTypeStats(
  repairs: Repair[],
  problemTypes: string[]
): ProblemTypeStats[] {
  return problemTypes.map(type => {
    const typeRepairs = repairs.filter(r => r.problem_type === type);
    const completed = typeRepairs.filter(r => r.status === 'completed' && r.started_at && r.completed_at);
    
    let avgHours = 0;
    if (completed.length > 0) {
      const total = completed.reduce((sum, r) => {
        return sum + dayjs(r.completed_at!).diff(dayjs(r.started_at!), 'hour', true);
      }, 0);
      avgHours = Math.round((total / completed.length) * 10) / 10;
    }

    return {
      type,
      avgHours,
      count: typeRepairs.length,
    };
  });
}

export interface CalendarInspectionInfo {
  date: dayjs.Dayjs;
  items: UpcomingInspection[];
  isOverdue: boolean;
}

export function getInspectionCalendarData(
  facilities: Facility[],
  year: number,
  month: number
): Map<string, CalendarInspectionInfo> {
  const calMap = new Map<string, CalendarInspectionInfo>();
  const monthStart = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`);
  const monthEnd = monthStart.endOf('month');
  const now = dayjs();

  facilities.forEach(f => {
    const lastDate = f.last_inspection_date ? dayjs(f.last_inspection_date) : monthStart.subtract(f.inspection_cycle_days, 'day');
    let nextDate = lastDate.add(f.inspection_cycle_days, 'day');

    while (nextDate.isBefore(monthStart) && nextDate.isBefore(now.add(365, 'day'))) {
      nextDate = nextDate.add(f.inspection_cycle_days, 'day');
    }

    while (nextDate.isBefore(monthEnd) || nextDate.isSame(monthEnd, 'day')) {
      if (nextDate.isAfter(monthStart.subtract(1, 'day'))) {
        const dateKey = nextDate.format('YYYY-MM-DD');
        if (!calMap.has(dateKey)) {
          calMap.set(dateKey, {
            date: nextDate,
            items: [],
            isOverdue: nextDate.isBefore(now.startOf('day')),
          });
        }
        const info = calMap.get(dateKey)!;
        info.items.push({
          facility: f,
          nextDate,
          daysLeft: nextDate.diff(now, 'day'),
        });
        if (nextDate.isBefore(now.startOf('day'))) {
          info.isOverdue = true;
        }
      }
      nextDate = nextDate.add(f.inspection_cycle_days, 'day');
    }
  });

  return calMap;
}

export { SEVERITY_CONFIG };
