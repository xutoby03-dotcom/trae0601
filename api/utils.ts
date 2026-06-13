export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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
