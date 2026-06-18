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

export const isOverdue = (expectedReturn: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedReturn);
  expected.setHours(0, 0, 0, 0);
  return expected < today;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateBatchNo = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CLN${dateStr}${random}`;
};

export const getDaysOverdue = (expectedReturn: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedReturn);
  expected.setHours(0, 0, 0, 0);
  const diff = today.getTime() - expected.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getTodayStr = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
