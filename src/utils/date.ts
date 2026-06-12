export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(0)}`;
};

export const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const daysUntil = (dateStr: string): number => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isExpired = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date.getTime() < Date.now();
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待取花',
    to_confirm: '待确认',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
};

export const getOperationTypeText = (type: string): string => {
  const map: Record<string, string> = {
    create: '创建预留',
    complete: '确认取花',
    cancel: '取消预留',
    reschedule: '改期',
    timeout: '超时未取',
  };
  return map[type] || type;
};
