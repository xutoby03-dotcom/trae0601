import { create } from 'zustand';
import type { StatisticsData } from '../types';
import { useRecoveryPointsStore } from './recoveryPoints';
import { useSortingRecordsStore } from './sortingRecords';
import { useExceptionsStore } from './exceptions';
import {
  calculateDonatableRatio,
  calculateSortingRatio,
  calculateCollectionEfficiency,
  calculateTimelyRate,
} from '../utils/calculations';
import { getCategoryText, getCategoryColor } from '../utils/formatters';

interface StatisticsState {
  getStatistics: () => StatisticsData;
}

export const useStatisticsStore = create<StatisticsState>((_set, get) => ({
  getStatistics: (): StatisticsData => {
    const { recoveryPoints } = useRecoveryPointsStore.getState();
    const { sortingRecords } = useSortingRecordsStore.getState();
    const { exceptions } = useExceptionsStore.getState();
    
    const totalRecoveryKg = recoveryPoints.reduce(
      (sum, rp) => sum + rp.currentKg,
      0
    );
    
    const completedSortingRecords = sortingRecords;
    const donatableRatio = calculateDonatableRatio(completedSortingRecords);
    
    const collectionRecords = [
      {
        collectionTime: '2026-06-17T10:00:00Z',
        createdAt: '2026-06-16T14:30:00Z',
      },
      {
        collectionTime: '2026-06-16T14:00:00Z',
        createdAt: '2026-06-15T18:00:00Z',
      },
      {
        collectionTime: '2026-06-15T09:00:00Z',
        createdAt: '2026-06-14T12:00:00Z',
      },
      {
        collectionTime: '2026-06-14T16:00:00Z',
        createdAt: '2026-06-13T08:00:00Z',
      },
    ];
    
    const collectionCompletionRate = calculateTimelyRate(collectionRecords);
    
    const exceptionCount = exceptions.filter(e => e.status !== 'resolved').length;
    
    const monthlyDropVolume = [
      { name: '1月', value: 1250 },
      { name: '2月', value: 1180 },
      { name: '3月', value: 1420 },
      { name: '4月', value: 1580 },
      { name: '5月', value: 1720 },
      { name: '6月', value: 1890 },
    ];
    
    const ratioData = calculateSortingRatio(completedSortingRecords);
    const sortingRatio = Object.entries(ratioData).map(([key, value]) => ({
      name: getCategoryText(key),
      value: Number((value * 100).toFixed(1)),
      color: getCategoryColor(key).replace('bg-', ''),
    }));
    
    const collectionEfficiency = [
      { date: '06-12', responseTime: 18.5 },
      { date: '06-13', responseTime: 22.3 },
      { date: '06-14', responseTime: 15.2 },
      { date: '06-15', responseTime: 20.1 },
      { date: '06-16', responseTime: 19.5 },
      { date: '06-17', responseTime: 17.8 },
      { date: '06-18', responseTime: 14.2 },
    ];
    
    const donationDestinations = [
      { source: '可捐赠衣物', target: '山区学校', value: 320 },
      { source: '可捐赠衣物', target: '贫困地区', value: 280 },
      { source: '可捐赠衣物', target: '社区爱心超市', value: 150 },
      { source: '可捐赠衣物', target: '农民工帮扶中心', value: 180 },
      { source: '可再生衣物', target: '再生纤维', value: 420 },
      { source: '可再生衣物', target: '工业抹布', value: 180 },
      { source: '破损报废', target: '环保销毁', value: 120 },
      { source: '需清洗', target: '清洗消毒中心', value: 220 },
    ];
    
    return {
      totalRecoveryKg,
      donatableRatio,
      collectionCompletionRate,
      exceptionCount,
      monthlyDropVolume,
      sortingRatio,
      collectionEfficiency,
      donationDestinations,
    };
  },
}));
