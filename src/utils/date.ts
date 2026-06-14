export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
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

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const hoursBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  return (end - start) / 3600000;
};

export const daysBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  return Math.floor((end - start) / 86400000);
};

export const formatHours = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)} 分钟`;
  if (hours < 24) return `${hours.toFixed(1)} 小时`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days} 天 ${remainingHours} 小时` : `${days} 天`;
};

export const getTodayISO = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
};

export const addHours = (dateStr: string, hours: number): string => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + hours * 3600000).toISOString();
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + days * 86400000).toISOString();
};
