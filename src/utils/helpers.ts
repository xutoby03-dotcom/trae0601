export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const getLuggageSpaceLabel = (space: string): string => {
  const labels: Record<string, string> = {
    small: '小件行李',
    medium: '中等行李',
    large: '大件行李'
  };
  return labels[space] || space;
};

export const getRouteStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    open: '招募中',
    full: '已满座',
    closed: '已关闭',
    completed: '已完成',
    cancelled: '已取消'
  };
  return labels[status] || status;
};

export const getBookingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    rejected: '已拒绝',
    cancelled: '已取消',
    completed: '已完成',
    no_show: '已爽约'
  };
  return labels[status] || status;
};

export const getRouteStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-700',
    full: 'bg-amber-100 text-amber-700',
    closed: 'bg-gray-100 text-gray-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getBookingStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    completed: 'bg-blue-100 text-blue-700',
    no_show: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getTimeMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isTimeWithin30Minutes = (time1: string, time2: string): boolean => {
  const diff = Math.abs(getTimeMinutes(time1) - getTimeMinutes(time2));
  return diff <= 30;
};
