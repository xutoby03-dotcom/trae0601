import { create } from 'zustand';
import { db } from '@/db';
import type { 
  StatisticsData, 
  DailyUsageRate, 
  FrequentlyMissing, 
  WeatherImpact,
  DailyRecord,
  Incident,
  Furniture
} from '@/types';
import { format, subDays } from 'date-fns';

interface StatisticsState {
  statistics: StatisticsData | null;
  loading: boolean;
  error: string | null;
}

interface StatisticsActions {
  calculateAllStatistics: (days?: number) => Promise<StatisticsData>;
  calculateDailyUsageRate: (days?: number) => Promise<DailyUsageRate[]>;
  calculateFrequentlyMissing: (days?: number) => Promise<FrequentlyMissing[]>;
  calculateWeatherImpact: (days?: number) => Promise<WeatherImpact[]>;
  getRepairList: () => Promise<Incident[]>;
  getTotalFurnitureCount: () => Promise<number>;
  getActiveBoothCount: () => Promise<number>;
  getPendingIncidentCount: () => Promise<number>;
  getMonthlyStatistics: (year: number, month: number) => Promise<{
    totalRecords: number;
    completedRecords: number;
    abnormalRecords: number;
    totalIncidents: number;
    resolvedIncidents: number;
  }>;
  clearError: () => void;
}

export type StatisticsStore = StatisticsState & StatisticsActions;

export const useStatisticsStore = create<StatisticsStore>((set) => ({
  statistics: null,
  loading: false,
  error: null,

  calculateAllStatistics: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const [dailyUsageRate, frequentlyMissing, weatherImpact, repairList] = await Promise.all([
        useStatisticsStore.getState().calculateDailyUsageRate(days),
        useStatisticsStore.getState().calculateFrequentlyMissing(days),
        useStatisticsStore.getState().calculateWeatherImpact(days),
        useStatisticsStore.getState().getRepairList(),
      ]);

      const statistics: StatisticsData = {
        dailyUsageRate,
        frequentlyMissing,
        weatherImpact,
        repairList,
      };

      set({ statistics, loading: false });
      return statistics;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '计算统计数据失败', loading: false });
      throw error;
    }
  },

  calculateDailyUsageRate: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      const records = await db.dailyRecords
        .where('recordDate')
        .between(startDateStr, endDateStr, true, true)
        .toArray();

      const totalFurniture = await db.furniture.count();
      
      const dateMap = new Map<string, number>();
      for (let i = 0; i < days; i++) {
        const date = format(subDays(endDate, days - 1 - i), 'yyyy-MM-dd');
        dateMap.set(date, 0);
      }

      records.forEach(record => {
        const rate = totalFurniture > 0 ? (record.furnitureCount / totalFurniture) * 100 : 0;
        dateMap.set(record.recordDate, Math.round(rate * 100) / 100);
      });

      const dailyUsageRate: DailyUsageRate[] = Array.from(dateMap.entries()).map(([date, rate]) => ({
        date,
        rate,
      }));

      return dailyUsageRate;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '计算使用率失败', loading: false });
      throw error;
    }
  },

  calculateFrequentlyMissing: async (days = 90) => {
    set({ loading: true, error: null });
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');

      const lossIncidents = await db.incidents
        .where('type')
        .equals('loss')
        .filter(incident => incident.reportTime >= startDateStr)
        .toArray();

      const furnitureMap = new Map<string, { count: number; code: string }>();
      
      for (const incident of lossIncidents) {
        const furniture = await db.furniture.get(incident.furnitureId);
        if (furniture) {
          const existing = furnitureMap.get(incident.furnitureId);
          if (existing) {
            existing.count++;
          } else {
            furnitureMap.set(incident.furnitureId, { count: 1, code: furniture.code });
          }
        }
      }

      const frequentlyMissing: FrequentlyMissing[] = Array.from(furnitureMap.entries())
        .map(([furnitureId, { count, code }]) => ({
          furnitureId,
          code,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return frequentlyMissing;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '计算高频丢失失败', loading: false });
      throw error;
    }
  },

  calculateWeatherImpact: async (days = 30) => {
    set({ loading: true, error: null });
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      const weatherRecords = await db.weatherInfo
        .where('recordDate')
        .between(startDateStr, endDateStr, true, true)
        .toArray();

      const incidents = await db.incidents
        .filter(incident => incident.reportTime >= startDateStr)
        .toArray();

      const weatherMap = new Map<string, string>();
      
      weatherRecords.forEach(weather => {
        weatherMap.set(weather.recordDate, weather.condition);
      });

      const impactMap = new Map<string, number>();
      
      incidents.forEach(incident => {
        const incidentDate = incident.reportTime.split('T')[0];
        const condition = weatherMap.get(incidentDate) || '未知';
        const existing = impactMap.get(condition);
        if (existing !== undefined) {
          impactMap.set(condition, existing + 1);
        } else {
          impactMap.set(condition, 1);
        }
      });

      const weatherImpact: WeatherImpact[] = Array.from(impactMap.entries())
        .map(([condition, incidentCount]) => ({
          condition,
          incidentCount,
        }))
        .sort((a, b) => b.incidentCount - a.incidentCount);

      return weatherImpact;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '计算天气影响失败', loading: false });
      throw error;
    }
  },

  getRepairList: async () => {
    set({ loading: true, error: null });
    try {
      const repairIncidents = await db.incidents
        .where('type')
        .equals('damage')
        .filter(incident => incident.status !== 'resolved')
        .reverse()
        .sortBy('createdAt');

      return repairIncidents;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取维修列表失败', loading: false });
      throw error;
    }
  },

  getTotalFurnitureCount: async () => {
    try {
      return await db.furniture.count();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取桌椅总数失败' });
      throw error;
    }
  },

  getActiveBoothCount: async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = await db.dailyRecords.where('recordDate').equals(today).first();
      return todayRecord?.furnitureCount || 0;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取外摆数量失败' });
      throw error;
    }
  },

  getPendingIncidentCount: async () => {
    try {
      return await db.incidents.where('status').equals('pending').count();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取待处理事件数失败' });
      throw error;
    }
  },

  getMonthlyStatistics: async (year, month) => {
    try {
      const startDate = format(new Date(year, month, 1), 'yyyy-MM-dd');
      const endDate = format(new Date(year, month + 1, 0), 'yyyy-MM-dd');

      const records = await db.dailyRecords
        .where('recordDate')
        .between(startDate, endDate, true, true)
        .toArray();

      const incidents = await db.incidents
        .filter(incident => {
          const incidentDate = incident.reportTime.split('T')[0];
          return incidentDate >= startDate && incidentDate <= endDate;
        })
        .toArray();

      return {
        totalRecords: records.length,
        completedRecords: records.filter(r => r.status === 'completed').length,
        abnormalRecords: records.filter(r => r.status === 'abnormal').length,
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
      };
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取月度统计失败' });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
