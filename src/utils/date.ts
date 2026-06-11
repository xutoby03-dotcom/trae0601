export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const getTodayStr = (): string => {
  return formatDate(new Date());
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export const diffDays = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isTimePast = (timeStr: string, hoursOffset: number = 0): boolean => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const targetTime = new Date();
  targetTime.setHours(hours + hoursOffset, minutes, 0, 0);
  return now > targetTime;
};

export const getHoursUntilNextSlot = (currentTime: string, nextSlot: string): number => {
  const [cH, cM] = currentTime.split(':').map(Number);
  const [nH, nM] = nextSlot.split(':').map(Number);
  const currentMinutes = cH * 60 + cM;
  const nextMinutes = nH * 60 + nM;
  const diff = nextMinutes - currentMinutes;
  return diff / 60;
};

export const getCurrentTimeStr = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const getMealTimingLabel = (timing: string): string => {
  switch (timing) {
    case 'before':
      return '饭前';
    case 'after':
      return '饭后';
    default:
      return '不限';
  }
};

export const getReactionLabel = (reaction: string): string => {
  switch (reaction) {
    case 'normal':
      return '正常';
    case 'vomiting':
      return '呕吐';
    case 'low-spirit':
      return '精神差';
    case 'good-appetite':
      return '食欲好';
    case 'other':
      return '其他';
    default:
      return reaction;
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return '待喂';
    case 'fed':
      return '已喂';
    case 'missed':
      return '漏喂';
    case 'skipped':
      return '跳过';
    default:
      return status;
  }
};
