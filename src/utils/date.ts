export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return date.toISOString().replace('T', ' ').substring(0, 16);
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

export const calculateMinutesDiff = (time1: string, time2: string): number => {
  const t1 = new Date(time1).getTime();
  const t2 = new Date(time2).getTime();
  return Math.floor((t2 - t1) / 60000);
};

export const getWeekRange = (date: Date = new Date()): { start: string; end: string } => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

export const isTimePassed = (hour: number, minute: number = 0): boolean => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  return now >= target;
};

export const formatTimeAgo = (dateStr: string): string => {
  const now = new Date().getTime();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
};
