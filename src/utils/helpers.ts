import { format, differenceInMinutes, addDays, addHours } from 'date-fns';
import { LadderStatus, ReservationStatus, Purpose, PURPOSES } from '@/types';

export const formatDateTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'yyyy-MM-dd HH:mm');
};

export const formatDate = (dateStr: string): string => {
  return format(new Date(dateStr), 'yyyy-MM-dd');
};

export const formatTime = (dateStr: string): string => {
  return format(new Date(dateStr), 'HH:mm');
};

export const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMins = differenceInMinutes(date, now);
  const absMins = Math.abs(diffMins);

  if (absMins < 60) {
    return diffMins >= 0 ? `${absMins} 分钟后` : `${absMins} 分钟前`;
  }
  if (absMins < 1440) {
    const hours = Math.floor(absMins / 60);
    return diffMins >= 0 ? `${hours} 小时后` : `${hours} 小时前`;
  }
  const days = Math.floor(absMins / 1440);
  return diffMins >= 0 ? `${days} 天后` : `${days} 天前`;
};

export const isOverdue = (expectedEndTime: string, borrowStartTime: string): boolean => {
  const now = new Date();
  const expected = new Date(expectedEndTime);
  const borrowStart = new Date(borrowStartTime);

  if (now < borrowStart) return false;
  return now > expected;
};

export const isOverdueByReservation = (expectedEndTime: string): boolean => {
  const now = new Date();
  const expected = new Date(expectedEndTime);
  return now > expected;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getDefaultStartTime = (): string => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return addHours(now, 1).toISOString().slice(0, 16);
};

export const getDefaultEndTime = (): string => {
  const start = new Date(getDefaultStartTime());
  return addHours(start, 4).toISOString().slice(0, 16);
};

export const getHourOfDay = (dateStr: string): number => {
  return new Date(dateStr).getHours();
};

export const getDayOfWeek = (dateStr: string): number => {
  return new Date(dateStr).getDay();
};

export const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export const getInitialLadders = () => [
  {
    id: 'ladder-1',
    name: '1 号梯',
    type: '人字梯（3米）',
    status: LadderStatus.AVAILABLE,
    description: '适合室内日常使用，轻巧方便',
  },
  {
    id: 'ladder-2',
    name: '2 号梯',
    type: '伸缩梯（5米）',
    status: LadderStatus.AVAILABLE,
    description: '可伸缩调节，适合较高作业',
  },
  {
    id: 'ladder-3',
    name: '3 号梯',
    type: '直梯（4米）',
    status: LadderStatus.AVAILABLE,
    description: '经典直梯，稳定可靠',
  },
];

export const getSampleData = () => {
  const now = new Date();

  return {
    sampleReservations: [
      {
        id: 'res-1',
        ladderId: 'ladder-2',
        borrowerName: '张阿姨',
        building: '3 号楼 2 单元',
        startTime: addDays(now, 1).toISOString(),
        expectedEndTime: addHours(addDays(now, 1), 3).toISOString(),
        purpose: PURPOSES[0] as Purpose,
        needHelp: false,
        phone: '138****5678',
        status: ReservationStatus.PENDING,
        createdAt: addHours(now, -2).toISOString(),
      },
      {
        id: 'res-2',
        ladderId: 'ladder-1',
        borrowerName: '李先生',
        building: '5 号楼 1 单元',
        startTime: addDays(now, -1).toISOString(),
        expectedEndTime: addHours(addDays(now, -1), 4).toISOString(),
        purpose: PURPOSES[1] as Purpose,
        needHelp: true,
        phone: '139****1234',
        status: ReservationStatus.BORROWED,
        createdAt: addDays(now, -2).toISOString(),
      },
    ],
    sampleBorrowRecords: [
      {
        id: 'borrow-1',
        reservationId: 'res-2',
        borrowTime: addDays(now, -1).toISOString(),
        operator: '王管理员',
      },
    ],
  };
};
