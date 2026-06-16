import { DailyCheckIn } from '@/types';
import { getToday } from '@/utils/date';

const today = getToday();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

export const mockCheckIns: DailyCheckIn[] = [
  {
    id: 'checkin-1',
    elderlyId: 'elderly-1',
    checkDate: today,
    source: 'elderly_phone',
    status: 'confirmed',
    checkTime: `${today} 08:15`,
    operatorId: 'user-1',
    notes: '老人身体状况良好',
  },
  {
    id: 'checkin-2',
    elderlyId: 'elderly-2',
    checkDate: today,
    source: 'family_report',
    status: 'confirmed',
    checkTime: `${today} 07:30`,
    operatorId: 'user-1',
    notes: '女儿代报，一切正常',
  },
  {
    id: 'checkin-3',
    elderlyId: 'elderly-3',
    checkDate: today,
    source: 'smart_device',
    status: 'confirmed',
    checkTime: `${today} 06:00`,
    operatorId: 'system',
    notes: '智能手环自动同步',
  },
  {
    id: 'checkin-4',
    elderlyId: 'elderly-7',
    checkDate: today,
    source: 'home_visit',
    status: 'confirmed',
    checkTime: `${today} 09:00`,
    operatorId: 'user-1',
    notes: '上门确认，老人正在吃早餐',
  },
  {
    id: 'checkin-5',
    elderlyId: 'elderly-9',
    checkDate: today,
    source: 'smart_device',
    status: 'confirmed',
    checkTime: `${today} 07:00`,
    operatorId: 'system',
    notes: '智能门禁数据同步',
  },
  {
    id: 'checkin-6',
    elderlyId: 'elderly-1',
    checkDate: yesterdayStr,
    source: 'elderly_phone',
    status: 'confirmed',
    checkTime: `${yesterdayStr} 08:20`,
    operatorId: 'user-1',
    notes: '',
  },
  {
    id: 'checkin-7',
    elderlyId: 'elderly-2',
    checkDate: yesterdayStr,
    source: 'family_report',
    status: 'confirmed',
    checkTime: `${yesterdayStr} 07:45`,
    operatorId: 'user-1',
    notes: '',
  },
  {
    id: 'checkin-8',
    elderlyId: 'elderly-4',
    checkDate: yesterdayStr,
    source: 'home_visit',
    status: 'confirmed',
    checkTime: `${yesterdayStr} 09:30`,
    operatorId: 'user-1',
    notes: '',
  },
];

export const getCheckInsByDate = (date: string): DailyCheckIn[] => {
  return mockCheckIns.filter(c => c.checkDate === date);
};

export const getCheckInsByElderly = (elderlyId: string): DailyCheckIn[] => {
  return mockCheckIns.filter(c => c.elderlyId === elderlyId);
};

export const getTodayCheckIns = (): DailyCheckIn[] => {
  return getCheckInsByDate(today);
};
