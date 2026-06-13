export const isOverdue = (lendTime: string): boolean => {
  const now = new Date();
  const lend = new Date(lendTime);
  const diffHours = (now.getTime() - lend.getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
};

export const getOverdueHours = (lendTime: string): number => {
  const now = new Date();
  const lend = new Date(lendTime);
  return Math.floor((now.getTime() - lend.getTime()) / (1000 * 60 * 60));
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getDefaultReturnTime = (): string => {
  const date = new Date();
  date.setHours(date.getHours() + 12);
  return date.toISOString().slice(0, 16);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
