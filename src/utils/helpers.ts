import { Activity, Registration } from '@/types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  let dayLabel = '';
  if (isSameDay(date, now)) dayLabel = '今天';
  else if (isSameDay(date, tomorrow)) dayLabel = '明天';
  else if (isSameDay(date, dayAfter)) dayLabel = '后天';
  else {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    dayLabel = weekDays[date.getDay()];
  }

  return `${month}月${day}日 ${dayLabel} ${hours}:${minutes}`;
};

export const formatTimeOnly = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateOnly = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];

  if (isSameDay(date, now)) return `今天 (${month}/${day})`;
  if (isSameDay(date, tomorrow)) return `明天 (${month}/${day})`;
  return `${month}月${day}日 ${weekDay}`;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export const isToday = (isoString: string): boolean => {
  return isSameDay(new Date(isoString), new Date());
};

export const isThisWeekend = (isoString: string): boolean => {
  const date = new Date(isoString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isUpcoming = (isoString: string): boolean => {
  return new Date(isoString) >= new Date();
};

export const getConfirmedCount = (regs: Registration[]): number => {
  return regs
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.attendeeCount, 0);
};

export const getWaitlistCount = (regs: Registration[]): number => {
  return regs.filter(r => r.status === 'waitlist').length;
};

export const getActivityStatus = (activity: Activity, regs: Registration[]): {
  label: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'ended';
} => {
  const now = new Date();
  const endTime = new Date(activity.endTime);
  const startTime = new Date(activity.startTime);

  if (now > endTime) {
    return { label: '已结束', type: 'ended' };
  }
  if (now >= startTime && now <= endTime) {
    return { label: '进行中', type: 'info' };
  }

  const confirmed = getConfirmedCount(regs);
  if (confirmed >= activity.maxParticipants) {
    return { label: '已满员', type: 'warning' };
  }
  return { label: '报名中', type: 'success' };
};

export const getLocalDateTimeInputValue = (isoString?: string): string => {
  const date = isoString ? new Date(isoString) : new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const getDaysUntil = (isoString: string): number => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const cn = (...classes: (string | false | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
