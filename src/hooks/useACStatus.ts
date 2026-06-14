import { useMemo } from 'react';
import { differenceInDays, addDays, parseISO } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import type { ACWithStatus, ACStatus, CleaningRecord } from '@/types';

function getACStatus(
  ac: { id: string; cleaningCycle: number },
  records: CleaningRecord[],
  now: Date
): { status: ACStatus; lastCleanDate?: string; daysSinceLastClean: number; nextCleanDate: string; latestRecord?: CleaningRecord } {
  const acRecords = records
    .filter((r) => r.acId === ac.id)
    .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());

  const latestRecord = acRecords[0];
  const lastCleanDate = latestRecord?.installedBackAt || latestRecord?.removedAt;
  const lastCleanDateObj = lastCleanDate ? parseISO(lastCleanDate) : null;

  const hasUnfinishedRecord = acRecords.some(
    (r) => !r.installedBackAt
  );
  const unfinishedRecord = acRecords.find((r) => !r.installedBackAt);

  if (hasUnfinishedRecord && unfinishedRecord) {
    if (unfinishedRecord.dryingStatus === 'dried') {
      return {
        status: 'completed',
        lastCleanDate,
        daysSinceLastClean: lastCleanDateObj ? differenceInDays(now, lastCleanDateObj) : 0,
        nextCleanDate: lastCleanDateObj
          ? addDays(lastCleanDateObj, ac.cleaningCycle).toISOString()
          : addDays(now, ac.cleaningCycle).toISOString(),
        latestRecord,
      };
    }
    return {
      status: 'drying',
      lastCleanDate,
      daysSinceLastClean: lastCleanDateObj ? differenceInDays(now, lastCleanDateObj) : 0,
      nextCleanDate: lastCleanDateObj
        ? addDays(lastCleanDateObj, ac.cleaningCycle).toISOString()
        : addDays(now, ac.cleaningCycle).toISOString(),
      latestRecord,
    };
  }

  if (!lastCleanDateObj) {
    return {
      status: 'pending',
      lastCleanDate: undefined,
      daysSinceLastClean: 999,
      nextCleanDate: now.toISOString(),
      latestRecord,
    };
  }

  const daysSinceLastClean = differenceInDays(now, lastCleanDateObj);
  const nextCleanDate = addDays(lastCleanDateObj, ac.cleaningCycle);

  if (daysSinceLastClean >= ac.cleaningCycle) {
    return {
      status: 'overdue',
      lastCleanDate,
      daysSinceLastClean,
      nextCleanDate: nextCleanDate.toISOString(),
      latestRecord,
    };
  }

  return {
    status: 'pending',
    lastCleanDate,
    daysSinceLastClean,
    nextCleanDate: nextCleanDate.toISOString(),
    latestRecord,
  };
}

function sortByPriority(acs: ACWithStatus[]): ACWithStatus[] {
  return [...acs].sort((a, b) => {
    if (a.status === 'drying' && b.status !== 'drying') return -1;
    if (a.status !== 'drying' && b.status === 'drying') return 1;
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'overdue' && b.status === 'overdue') {
      return b.daysSinceLastClean - a.daysSinceLastClean;
    }
    return b.daysSinceLastClean - a.daysSinceLastClean;
  });
}

export function useACStatus() {
  const { airConditioners, cleaningRecords } = useAppStore();
  const now = new Date();

  const acsWithStatus = useMemo<ACWithStatus[]>(() => {
    return airConditioners.map((ac) => {
      const statusInfo = getACStatus(ac, cleaningRecords, now);
      return {
        ...ac,
        ...statusInfo,
      };
    });
  }, [airConditioners, cleaningRecords, now]);

  const sortedACs = useMemo(() => sortByPriority(acsWithStatus), [acsWithStatus]);

  const getACById = (id: string): ACWithStatus | undefined => {
    return acsWithStatus.find((ac) => ac.id === id);
  };

  const getRecordsByACId = (acId: string): CleaningRecord[] => {
    return cleaningRecords
      .filter((r) => r.acId === acId)
      .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
  };

  return {
    acsWithStatus: sortedACs,
    getACById,
    getRecordsByACId,
  };
}
