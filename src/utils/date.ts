export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const daysBetween = (date1: string | Date, date2: string | Date): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : new Date(date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const daysFromNow = (date: string | Date): number => {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date: string | Date, days: number): string => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const addMonths = (date: string | Date, months: number): string => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

export const isExpired = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date() > d;
};

export const getAgeInMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

export const isWinterSeason = (): boolean => {
  const month = new Date().getMonth() + 1;
  return month >= 11 || month <= 2;
};

export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const getRelativeTimeString = (date: string | Date): string => {
  const days = daysFromNow(date);
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === -1) return '昨天';
  if (days > 0 && days < 30) return `${days} 天后`;
  if (days < 0 && days > -30) return `${Math.abs(days)} 天前`;
  return formatDate(date);
};

export const calculateExpiryDate = (manufactureDate: string, years: number = 6): string => {
  const d = new Date(manufactureDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};
