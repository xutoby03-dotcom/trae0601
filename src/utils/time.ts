import dayjs from 'dayjs';

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 12; hour < 20; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
}

export function generateDateOptions(days: number = 7): { date: string; label: string; weekday: string }[] {
  const options: { date: string; label: string; weekday: string }[] = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  for (let i = 0; i < days; i++) {
    const date = dayjs().add(i, 'day');
    options.push({
      date: date.format('YYYY-MM-DD'),
      label: date.format('MM/DD'),
      weekday: weekdays[date.day()],
    });
  }
  
  return options;
}

export function getNextHalfHour(): string {
  const now = dayjs();
  const minutes = now.minute();
  if (minutes < 30) {
    return now.minute(30).format('HH:mm');
  }
  return now.add(1, 'hour').minute(0).format('HH:mm');
}

export function calculateDuration(start: string, end: string): number {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`;
}

export function formatDate(date: string): string {
  return dayjs(date).format('YYYY年MM月DD日');
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待签到',
    checked_in: '使用中',
    completed: '已完成',
    no_show: '爽约',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    checked_in: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-800',
    no_show: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
}

export function getChairStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    available: '可预约',
    in_use: '使用中',
    dirty: '待清洁',
    maintenance: '维护中',
  };
  return statusMap[status] || status;
}

export function getChairStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-800',
    in_use: 'bg-blue-100 text-blue-800',
    dirty: 'bg-amber-100 text-amber-800',
    maintenance: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
}
