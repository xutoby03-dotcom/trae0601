export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isSummerPeak = (): boolean => {
  const month = new Date().getMonth() + 1;
  return month >= 6 && month <= 8;
};

export const getDaysUntilSummerEnd = (): number => {
  const now = new Date();
  const endOfSummer = new Date(now.getFullYear(), 7, 31);
  const diff = endOfSummer.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getEquipmentAge = (purchaseDate: string): number => {
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const diffMs = now.getTime() - purchase.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
};
