export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  return formatDate(timestamp);
}

export function getVisibilityLevel(visibility: number): {
  level: string;
  color: string;
  description: string;
} {
  if (visibility < 200) return { level: '浓雾', color: 'chip-warning', description: '能见度极差' };
  if (visibility < 500) return { level: '大雾', color: 'chip-caution', description: '能见度差' };
  if (visibility < 1000) return { level: '雾', color: 'chip-info', description: '能见度一般' };
  if (visibility < 5000) return { level: '薄雾', color: 'chip-info', description: '轻度雾' };
  return { level: '良好', color: 'chip-safe', description: '能见度良好' };
}
