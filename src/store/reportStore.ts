import { create } from 'zustand';
import { WeeklyReport, Elderly, ExceptionRecord, DailyCheckIn } from '@/types';
import { getWeekRange, formatDate } from '@/utils/date';
import { mockGrids } from '@/data/grids';

interface ReportState {
  generateWeeklyReport: (
    gridId: string,
    elderlyList: Elderly[],
    exceptions: ExceptionRecord[],
    checkIns: DailyCheckIn[]
  ) => WeeklyReport;
  getAllWeeklyReports: (
    elderlyList: Elderly[],
    exceptions: ExceptionRecord[],
    checkIns: DailyCheckIn[]
  ) => WeeklyReport[];
  getFocusList: (
    elderlyList: Elderly[],
    exceptions: ExceptionRecord[],
    checkIns: DailyCheckIn[]
  ) => Elderly[];
}

export const useReportStore = create<ReportState>((set, get) => ({
  generateWeeklyReport: (gridId, elderlyList, exceptions, checkIns) => {
    const { start, end } = getWeekRange();
    const gridElderly = elderlyList.filter(e => e.gridId === gridId);
    const elderlyIds = gridElderly.map(e => e.id);
    
    const weekExceptions = exceptions.filter(e => 
      e.exceptionDate >= start && e.exceptionDate <= end && elderlyIds.includes(e.elderlyId)
    );
    
    const weekCheckIns = checkIns.filter(c => 
      c.checkDate >= start && c.checkDate <= end && elderlyIds.includes(c.elderlyId)
    );
    
    const unreportedElderly = new Set<string>();
    const consecutiveExceptions = new Set<string>();
    
    weekExceptions.forEach(e => {
      unreportedElderly.add(e.elderlyId);
    });
    
    elderlyIds.forEach(id => {
      const elderExceptions = weekExceptions.filter(e => e.elderlyId === id);
      if (elderExceptions.length >= 3) {
        consecutiveExceptions.add(id);
      }
    });
    
    const resolvedExceptions = weekExceptions.filter(e => e.status === 'resolved' && e.resolvedTime);
    const avgHandlingTime = resolvedExceptions.length > 0
      ? resolvedExceptions.reduce((sum, e) => {
          if (e.resolvedTime && e.firstReminderTime) {
            const diff = new Date(e.resolvedTime).getTime() - new Date(e.firstReminderTime).getTime();
            return sum + diff / 60000;
          }
          return sum;
        }, 0) / resolvedExceptions.length
      : 0;
    
    const focusList = Array.from(consecutiveExceptions);
    gridElderly.forEach(e => {
      if (e.chronicDiseases.includes('阿尔茨海默症') || e.chronicDiseases.includes('心脏病') || e.chronicDiseases.includes('肾病')) {
        if (!focusList.includes(e.id)) {
          focusList.push(e.id);
        }
      }
    });
    
    return {
      gridId,
      weekStartDate: start,
      weekEndDate: end,
      totalElderly: gridElderly.length,
      unreportedCount: unreportedElderly.size,
      continuousExceptionCount: consecutiveExceptions.size,
      avgHandlingTime: Math.round(avgHandlingTime),
      focusList,
    };
  },

  getAllWeeklyReports: (elderlyList, exceptions, checkIns) => {
    return mockGrids.map(grid => 
      get().generateWeeklyReport(grid.id, elderlyList, exceptions, checkIns)
    );
  },

  getFocusList: (elderlyList, exceptions, checkIns) => {
    const { start, end } = getWeekRange();
    
    const consecutiveMap = new Map<string, number>();
    
    exceptions.forEach(e => {
      if (e.exceptionDate >= start && e.exceptionDate <= end) {
        consecutiveMap.set(e.elderlyId, (consecutiveMap.get(e.elderlyId) || 0) + 1);
      }
    });
    
    const focusElderly = elderlyList.filter(e => {
      const exceptionCount = consecutiveMap.get(e.id) || 0;
      const hasSeriousDisease = e.chronicDiseases.includes('阿尔茨海默症') || 
                               e.chronicDiseases.includes('心脏病') || 
                               e.chronicDiseases.includes('肾病');
      return exceptionCount >= 3 || hasSeriousDisease;
    });
    
    return focusElderly.sort((a, b) => {
      const countA = consecutiveMap.get(a.id) || 0;
      const countB = consecutiveMap.get(b.id) || 0;
      return countB - countA;
    });
  },
}));
