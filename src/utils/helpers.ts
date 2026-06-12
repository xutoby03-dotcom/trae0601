import type { Point, AnomalyTicket, InspectionRecord } from '../types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const isOverdue = (point: Point): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(point.nextInspectionDate);
  nextDate.setHours(0, 0, 0, 0);
  return today > nextDate;
};

export const getDaysUntilDue = (point: Point): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(point.nextInspectionDate);
  nextDate.setHours(0, 0, 0, 0);
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getAnomalyStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待维修',
    reported: '已报修',
    reviewed: '已复查',
  };
  return statusMap[status] || status;
};

export const getInspectionStatusText = (status: string): string => {
  return status === 'normal' ? '正常' : '异常';
};

export const getDeviceTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    '灭火器': '🧯',
    '应急灯': '💡',
    '安全出口贴纸': '🚪',
  };
  return iconMap[type] || '📦';
};

export const calculateStatistics = (
  points: Point[],
  records: InspectionRecord[],
  tickets: AnomalyTicket[]
) => {
  const floorMap = new Map<string, { total: number; passed: number }>();
  const typeMap = new Map<string, number>();

  points.forEach((point) => {
    if (!floorMap.has(point.area)) {
      floorMap.set(point.area, { total: 0, passed: 0 });
    }
    const floorData = floorMap.get(point.area)!;
    floorData.total++;

    const pointRecords = records.filter((r) => r.pointId === point.id);
    if (pointRecords.length > 0) {
      const lastRecord = pointRecords[pointRecords.length - 1];
      if (lastRecord.status === 'normal') {
        floorData.passed++;
      }
    }
  });

  const floorPassRate = Array.from(floorMap.entries()).map(([floor, data]) => ({
    floor,
    total: data.total,
    passed: data.passed,
    passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
  }));

  tickets.forEach((ticket) => {
    const point = points.find((p) => p.id === ticket.pointId);
    if (point) {
      const current = typeMap.get(point.deviceType) || 0;
      typeMap.set(point.deviceType, current + 1);
    }
  });

  const anomalyByType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type,
    count,
  }));

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const openTicketsThisMonth = tickets.filter((ticket) => {
    const ticketDate = new Date(ticket.createdAt);
    return (
      ticket.status !== 'reviewed' &&
      ticketDate.getMonth() === thisMonth &&
      ticketDate.getFullYear() === thisYear
    );
  });

  const overduePoints = points.filter(isOverdue);

  return {
    floorPassRate,
    anomalyByType,
    openTicketsThisMonth,
    overduePoints,
  };
};

export const addDays = (date: string | Date, days: number): string => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const isThisMonth = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};
