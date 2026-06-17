import { create } from 'zustand';
import type { WeeklyGasData, AbnormalRankItem, BalloonGasRankItem } from '@/types';
import { mockInflationRecords, mockAbnormalRecords, mockCylinders, mockBalloonTypes, mockOrders } from '@/data/mockData';
import { getWeekLabel } from '@/utils/date';

interface StatsState {
  getWeeklyGasUsage: () => WeeklyGasData[];
  getTotalProfit: () => { weekly: number; monthly: number; weeklyChange: number };
  getAbnormalRank: () => AbnormalRankItem[];
  getBalloonGasRank: () => BalloonGasRankItem[];
  getTotalGasUsed: () => number;
  getActiveCylinders: () => number;
  getAbnormalCylinders: () => number;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  getWeeklyGasUsage: () => {
    const now = new Date();
    const weeklyData: { [key: string]: number } = {};

    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      const weekLabel = getWeekLabel(date);
      weeklyData[weekLabel] = 0;
    }

    mockInflationRecords.forEach((record) => {
      const date = new Date(record.createdAt);
      const weekLabel = getWeekLabel(date);
      if (weeklyData.hasOwnProperty(weekLabel)) {
        weeklyData[weekLabel] += record.gasUsed;
      }
    });

    return Object.entries(weeklyData).map(([week, gasUsed]) => ({
      week,
      gasUsed: Number(gasUsed.toFixed(1)),
    }));
  },

  getTotalProfit: () => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let weeklyProfit = 0;
    let lastWeekProfit = 0;
    let monthlyProfit = 0;

    mockOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= weekAgo) {
        weeklyProfit += order.profit;
      }
      if (orderDate >= twoWeeksAgo && orderDate < weekAgo) {
        lastWeekProfit += order.profit;
      }
      if (orderDate >= monthAgo) {
        monthlyProfit += order.profit;
      }
    });

    const weeklyChange = lastWeekProfit > 0
      ? Number(((weeklyProfit - lastWeekProfit) / lastWeekProfit) * 100)
      : 0;

    return {
      weekly: weeklyProfit,
      monthly: monthlyProfit,
      weeklyChange: Number(weeklyChange.toFixed(1)),
    };
  },

  getAbnormalRank: () => {
    const countMap: { [key: string]: number } = {};

    mockAbnormalRecords.forEach((record) => {
      const cylinder = mockCylinders.find((c) => c.id === record.cylinderId);
      if (cylinder) {
        countMap[cylinder.cylinderNo] = (countMap[cylinder.cylinderNo] || 0) + 1;
      }
    });

    return Object.entries(countMap)
      .map(([cylinderNo, count]) => ({ cylinderNo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  getBalloonGasRank: () => {
    const gasMap: { [key: string]: number } = {};
    let totalGas = 0;

    mockInflationRecords.forEach((record) => {
      const balloon = mockBalloonTypes.find((b) => b.id === record.balloonTypeId);
      if (balloon) {
        gasMap[balloon.name] = (gasMap[balloon.name] || 0) + record.gasUsed;
        totalGas += record.gasUsed;
      }
    });

    return Object.entries(gasMap)
      .map(([name, totalGasValue]) => ({
        name,
        totalGas: Number(totalGasValue.toFixed(1)),
        percentage: totalGas > 0 ? Number(((totalGasValue / totalGas) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalGas - a.totalGas)
      .slice(0, 5);
  },

  getTotalGasUsed: () => {
    return mockInflationRecords.reduce((sum, record) => sum + record.gasUsed, 0);
  },

  getActiveCylinders: () => {
    return mockCylinders.filter((c) => c.status === 'normal').length;
  },

  getAbnormalCylinders: () => {
    return mockCylinders.filter((c) => c.status === 'abnormal' || c.status === 'expired').length;
  },
}));
