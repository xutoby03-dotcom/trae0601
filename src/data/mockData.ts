import type { FoldingTable, BorrowRecord, ReturnRecord } from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString();

const daysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDateTime(d);
};

const daysLater = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatDateTime(d);
};

export const mockTables: FoldingTable[] = [
  {
    id: 'T-001',
    size: '120cm × 60cm',
    storageCabinet: 'A区1号柜',
    scratchCount: 2,
    footPadCount: 4,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    status: 'available',
    issueTags: [],
    hasTablecloth: true,
  },
  {
    id: 'T-002',
    size: '120cm × 60cm',
    storageCabinet: 'A区1号柜',
    scratchCount: 5,
    footPadCount: 3,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=300&fit=crop',
    status: 'available',
    issueTags: ['missing_parts'],
    hasTablecloth: true,
  },
  {
    id: 'T-003',
    size: '120cm × 60cm',
    storageCabinet: 'A区2号柜',
    scratchCount: 1,
    footPadCount: 4,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop',
    status: 'borrowed',
    issueTags: ['overdue'],
    hasTablecloth: false,
  },
  {
    id: 'T-004',
    size: '100cm × 50cm',
    storageCabinet: 'A区2号柜',
    scratchCount: 0,
    footPadCount: 4,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop',
    status: 'available',
    issueTags: [],
    hasTablecloth: true,
  },
  {
    id: 'T-005',
    size: '100cm × 50cm',
    storageCabinet: 'B区1号柜',
    scratchCount: 8,
    footPadCount: 2,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    status: 'maintenance',
    issueTags: ['desktop_damaged', 'missing_parts'],
    hasTablecloth: false,
  },
  {
    id: 'T-006',
    size: '120cm × 60cm',
    storageCabinet: 'B区1号柜',
    scratchCount: 3,
    footPadCount: 4,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    status: 'borrowed',
    issueTags: [],
    hasTablecloth: true,
  },
  {
    id: 'T-007',
    size: '120cm × 60cm',
    storageCabinet: 'B区2号柜',
    scratchCount: 4,
    footPadCount: 3,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop',
    status: 'available',
    issueTags: ['missing_parts'],
    hasTablecloth: false,
  },
  {
    id: 'T-008',
    size: '100cm × 50cm',
    storageCabinet: 'B区2号柜',
    scratchCount: 2,
    footPadCount: 4,
    totalFootPads: 4,
    photo: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    status: 'available',
    issueTags: [],
    hasTablecloth: true,
  },
];

export const mockBorrowRecords: BorrowRecord[] = [
  {
    id: 'BR-001',
    tableId: 'T-003',
    residentName: '张阿姨',
    residentRoom: '3栋502',
    purpose: '孙子生日会',
    moveTo: '活动室大厅',
    expectedReturn: daysAgo(2),
    withTablecloth: true,
    borrowTime: daysAgo(5),
    status: 'overdue',
  },
  {
    id: 'BR-002',
    tableId: 'T-006',
    residentName: '李先生',
    residentRoom: '5栋1203',
    purpose: '周末读书会',
    moveTo: '活动室2号厅',
    expectedReturn: daysLater(1),
    withTablecloth: false,
    borrowTime: daysAgo(1),
    status: 'active',
  },
];

export const mockReturnRecords: ReturnRecord[] = [
  {
    id: 'RR-001',
    borrowId: 'BR-000',
    desktopOk: true,
    desktopNote: '',
    legsOk: false,
    legsNote: '少了1个脚垫',
    lockOk: true,
    lockNote: '',
    tableclothReturned: true,
    positionCorrect: true,
    overallStatus: 'minor',
    returnTime: daysAgo(3),
  },
];

export const getWeeklyAvailability = (): { day: string; count: number; date: string }[] => {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const result = [];
  const baseDate = new Date(today);
  const dayOfWeek = baseDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  baseDate.setDate(baseDate.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const isPast = d < new Date(today.setHours(0, 0, 0, 0));
    result.push({
      day: weekDays[i],
      count: isPast ? Math.floor(Math.random() * 3) + 4 : 5,
      date: formatDate(d),
    });
  }
  return result;
};
