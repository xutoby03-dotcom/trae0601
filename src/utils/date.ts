export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatMonth = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
  });
};

export const getDaysBetween = (start: string | Date, end: string | Date): number => {
  const s = typeof start === 'string' ? new Date(start) : new Date(start);
  const e = typeof end === 'string' ? new Date(end) : new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const getMonthsAgo = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split('T')[0];
};

export const today = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
};

export const getMonthKey = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getLast6Months = (): { key: string; label: string }[] => {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: getMonthKey(d),
      label: formatMonth(d),
    });
  }
  return result;
};

export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};
