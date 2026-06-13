export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const getHoursLater = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const getDaysLater = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const isOverdue = (promisedTime: string): boolean => {
  return new Date() > new Date(promisedTime);
};

export const getDuration = (start: string, end: string): number => {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60));
};

export const formatDuration = (hours: number): string => {
  if (hours < 24) return `${hours}小时`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`;
};

export const isWithinWeek = (dateStr: string): boolean => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  const date = new Date(dateStr);
  return date >= weekAgo && date <= now;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
