import { useMemo } from 'react';
import { startOfMonth, isAfter, parseISO } from 'date-fns';
import { useACStatus } from './useACStatus';
import { useAppStore } from '@/store/useAppStore';
import type { DashboardStats, DustLevel, ACWithStatus } from '@/types';

const DUST_LEVEL_WEIGHT: Record<DustLevel, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
};

export function useDashboard() {
  const { acsWithStatus } = useACStatus();
  const { cleaningRecords, airConditioners } = useAppStore();

  const stats = useMemo<DashboardStats>(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const monthlyRecords = cleaningRecords.filter((r) =>
      isAfter(parseISO(r.createdAt), monthStart)
    );

    const monthlyCleanCount = monthlyRecords.length;

    const roomDustScores = new Map<string, { count: number; totalScore: number; maxDust: DustLevel }>();

    acsWithStatus.forEach((ac) => {
      const acRecords = cleaningRecords.filter((r) => r.acId === ac.id);
      const recentRecords = acRecords.slice(0, 5);
      if (recentRecords.length > 0) {
        const totalScore = recentRecords.reduce((sum, r) => sum + DUST_LEVEL_WEIGHT[r.dustLevel], 0);
        const maxDust = recentRecords.reduce(
          (max, r) => (DUST_LEVEL_WEIGHT[r.dustLevel] > DUST_LEVEL_WEIGHT[max] ? r.dustLevel : max),
          'light' as DustLevel
        );
        roomDustScores.set(ac.room, {
          count: recentRecords.length,
          totalScore,
          maxDust,
        });
      }
    });

    let dirtiestRoom: { room: string; count: number; dustLevel: DustLevel } = {
      room: '-',
      count: 0,
      dustLevel: 'light',
    };

    if (roomDustScores.size > 0) {
      let maxScore = -1;
      roomDustScores.forEach((value, room) => {
        const avgScore = value.totalScore / value.count;
        if (avgScore > maxScore) {
          maxScore = avgScore;
          dirtiestRoom = {
            room,
            count: value.count,
            dustLevel: value.maxDust,
          };
        }
      });
    }

    const statusCounts = {
      pending: acsWithStatus.filter((ac) => ac.status === 'pending').length,
      drying: acsWithStatus.filter((ac) => ac.status === 'drying').length,
      completed: acsWithStatus.filter((ac) => ac.status === 'completed').length,
      overdue: acsWithStatus.filter((ac) => ac.status === 'overdue').length,
    };

    const priorityAC = acsWithStatus.find(
      (ac) => ac.status === 'overdue' || ac.status === 'drying'
    ) || acsWithStatus[0];

    const nextPriority = priorityAC
      ? {
          ac: airConditioners.find((a) => a.id === priorityAC.id) || priorityAC,
          daysOverdue:
            priorityAC.status === 'overdue'
              ? priorityAC.daysSinceLastClean - priorityAC.cleaningCycle
              : 0,
          status: priorityAC.status,
        }
      : {
          ac: airConditioners[0] || ({} as any),
          daysOverdue: 0,
          status: 'completed' as const,
        };

    return {
      monthlyCleanCount,
      dirtiestRoom,
      nextPriority,
      statusCounts,
    };
  }, [acsWithStatus, cleaningRecords, airConditioners]);

  const groupedByStatus = useMemo(() => {
    const groups: Record<string, ACWithStatus[]> = {
      drying: [],
      overdue: [],
      pending: [],
      completed: [],
    };
    acsWithStatus.forEach((ac) => {
      groups[ac.status].push(ac);
    });
    return groups;
  }, [acsWithStatus]);

  return {
    stats,
    groupedByStatus,
    acsWithStatus,
  };
}
