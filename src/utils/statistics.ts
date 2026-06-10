import type { FaultTicket, StatisticsData, FaultStatus, FaultPhenomenon, ElevatorId } from '@/shared/types';
import { durationMinutes, monthKey } from '@/utils/time';
import { PHENOMENON_OPTIONS } from '@/shared/constants';

function elevatorKey(e: ElevatorId): string {
  return `${e.building}-${e.unit}-${e.elevatorNo}`;
}

export function computeStatistics(tickets: FaultTicket[]): StatisticsData {
  const now = Date.now();

  const elevatorCount: Record<string, { elevator: ElevatorId; count: number }> = {};
  const phenomCount: Record<string, number> = {};
  const buildingCount: Record<string, number> = {};
  const monthCount: Record<string, number> = {};
  const statusDuration: Partial<Record<FaultStatus, number>> = {};

  let totalRecovery = 0;
  let recoveredCount = 0;
  let activeCount = 0;

  tickets.forEach((t) => {
    const k = elevatorKey(t.elevator);
    elevatorCount[k] = elevatorCount[k] || { elevator: t.elevator, count: 0 };
    elevatorCount[k].count += 1;

    phenomCount[t.phenomenon] = (phenomCount[t.phenomenon] || 0) + 1;
    buildingCount[t.elevator.building] = (buildingCount[t.elevator.building] || 0) + 1;
    const mk = monthKey(t.occurredAt);
    monthCount[mk] = (monthCount[mk] || 0) + 1;

    if (t.status === 'recovered' || t.status === 'repeated') {
      if (t.recoveredAt) {
        const dur = durationMinutes(t.occurredAt, t.recoveredAt);
        totalRecovery += dur;
        recoveredCount += 1;
      }
    }
    if (t.status !== 'recovered' && t.status !== 'repeated') {
      activeCount += 1;
    }

    t.timeline.forEach((node, i) => {
      const next = t.timeline[i + 1];
      const end = next ? next.timestamp : t.status === node.status ? now : t.timeline[i].timestamp;
      const dur = durationMinutes(node.timestamp, end);
      statusDuration[node.status] = (statusDuration[node.status] || 0) + dur;
    });
  });

  const topFaultElevators = Object.values(elevatorCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const repeatedFaultTypes: { phenomenon: FaultPhenomenon; count: number }[] = PHENOMENON_OPTIONS.map((p) => ({
    phenomenon: p.value,
    count: phenomCount[p.value] || 0,
  }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const buildingFaultCounts = Object.entries(buildingCount)
    .map(([building, count]) => ({ building, count }))
    .sort((a, b) => b.count - a.count);

  const monthlyTrend = Object.entries(monthCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  return {
    topFaultElevators,
    avgRecoveryTime: recoveredCount > 0 ? totalRecovery / recoveredCount : 0,
    statusDuration,
    repeatedFaultTypes,
    buildingFaultCounts,
    monthlyTrend,
    totalTickets: tickets.length,
    recoveredCount,
    activeCount,
  };
}

export function sortTicketsForList(tickets: FaultTicket[]): FaultTicket[] {
  const statusRank: Record<FaultStatus, number> = {
    urgent: 0,
    processing: 1,
    waiting_parts: 2,
    recovered: 4,
    repeated: 3,
  };
  return [...tickets].sort((a, b) => {
    if (a.hasTrapped !== b.hasTrapped) return a.hasTrapped ? -1 : 1;
    const fa = (a.elevator.floorCount || 0) >= 20 ? 1 : 0;
    const fb = (b.elevator.floorCount || 0) >= 20 ? 1 : 0;
    if (fa !== fb) return fb - fa;
    const sr = statusRank[a.status] - statusRank[b.status];
    if (sr !== 0) return sr;
    if (b.occurredAt !== a.occurredAt) return b.occurredAt - a.occurredAt;
    return (b.repeatedCount || 0) - (a.repeatedCount || 0);
  });
}
