import type {
  Department,
  ParkingTicket,
  StatsData,
  TicketInventory,
  Visitor,
} from '@/types';
import { hoursBetween, isSameDay, startOfToday } from './dateUtils';

export function computeStats(
  visitors: Visitor[],
  tickets: ParkingTicket[],
  departments: Department[],
  inventory: TicketInventory,
): StatsData {
  const today = startOfToday();
  const todayVisitors = visitors.filter((v) => isSameDay(v.expectedArrival, today));
  const ticketMap = new Map(tickets.map((t) => [t.visitorId, t]));

  const todayTicketIds = new Set<string>();
  let pendingCount = 0;
  let overdueCount = 0;
  const deptCountMap = new Map<string, number>();
  const usedDurations: number[] = [];

  visitors.forEach((v) => {
    const ticket = ticketMap.get(v.id);
    if (ticket) {
      if (isSameDay(v.expectedArrival, today) || isSameDay(ticket.issuedAt, today)) {
        todayTicketIds.add(ticket.id);
      }
      if (ticket.isUsed && ticket.actualDuration != null) {
        usedDurations.push(ticket.actualDuration);
      }
      if (!ticket.isUsed) {
        const depTime = new Date(v.expectedDeparture).getTime();
        if (depTime < Date.now()) {
          overdueCount += 1;
          pendingCount += 1;
        } else {
          pendingCount += 1;
        }
      }
    }

    const count = deptCountMap.get(v.departmentId) ?? 0;
    deptCountMap.set(v.departmentId, count + 1);
  });

  let maxCount = 0;
  deptCountMap.forEach((c) => {
    if (c > maxCount) maxCount = c;
  });

  const deptUsage = departments
    .map((dept) => {
      const count = deptCountMap.get(dept.id) ?? 0;
      return {
        deptId: dept.id,
        deptName: dept.name,
        count,
        color: dept.color,
        percentage: maxCount > 0 ? (count / maxCount) * 100 : 0,
      };
    })
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const avgDuration =
    usedDurations.length > 0
      ? usedDurations.reduce((s, d) => s + d, 0) / usedDurations.length
      : 0;

  const remainingInventory = Math.max(0, inventory.total - inventory.used);

  return {
    todayUsedCount: todayTicketIds.size,
    pendingCount,
    avgDuration,
    remainingInventory,
    deptUsage,
    overdueCount,
  };
}

export function computeActualDuration(issuedAt: string, usedAt: string): number {
  return hoursBetween(issuedAt, usedAt);
}
