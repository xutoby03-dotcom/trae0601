export function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

export function getHoursAgo(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / 3600000);
}

export function getMarkerOpacity(dateStr: string): number {
  const hoursAgo = getHoursAgo(dateStr);
  if (hoursAgo <= 1) return 1;
  if (hoursAgo <= 24) {
    return Math.max(0.1, 1 - (hoursAgo - 1) * 0.04);
  }
  return 0.1;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getDurationHours(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 3600000);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return '不到1小时';
  if (hours < 24) return `${hours}小时`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days}天`;
  return `${days}天${remainingHours}小时`;
}
