import type { BookingRecord } from '@/types';

const TODAY = new Date();
const formatDate = (d: Date) => d.toISOString().slice(0, 10);

export const MOCK_TODAY_BOOKINGS: BookingRecord[] = [
  {
    deviceId: 'profoto-d2',
    deviceName: 'Profoto D2',
    deviceModel: 'D2 1000 AirTTL',
    bookedBy: '张立伟（静物组）',
    date: formatDate(TODAY),
    startTime: '09:00',
    endTime: '13:00',
  },
  {
    deviceId: 'aputure-600d',
    deviceName: 'Aputure 600D',
    deviceModel: 'LS 600d Pro',
    bookedBy: '时尚组 / Ella',
    date: formatDate(TODAY),
    startTime: '14:00',
    endTime: '19:00',
  },
  {
    deviceId: 'bg-paper-black',
    deviceName: '背景纸 纯黑',
    deviceModel: 'Deep Black 2.72×11m',
    bookedBy: '人像组 / 王浩',
    date: formatDate(TODAY),
    startTime: '10:00',
    endTime: '18:00',
  },
];

export const MOCK_ALL_BOOKINGS: BookingRecord[] = [...MOCK_TODAY_BOOKINGS];
