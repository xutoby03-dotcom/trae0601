export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getWaitTime(createdAt: number): string {
  const seconds = Math.floor((Date.now() - createdAt) / 1000);
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${mins}分钟`;
}

export function getCountdown(calledAt: number, threshold: number): { remaining: number; isUrgent: boolean } {
  const elapsed = Math.floor((Date.now() - calledAt) / 1000);
  const remaining = Math.max(0, threshold - elapsed);
  return {
    remaining,
    isUrgent: remaining < 30,
  };
}

export const statusLabels: Record<string, { label: string; className: string }> = {
  waiting: { label: '等待中', className: 'bg-champagne-100 text-champagne-700' },
  called: { label: '已叫号', className: 'bg-burgundy-100 text-burgundy-700 animate-pulse-slow' },
  fitting: { label: '试衣中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
  timeout: { label: '已超时', className: 'bg-red-100 text-red-700' },
};

export const cleanStatusLabels: Record<string, { label: string; className: string }> = {
  clean: { label: '已清洁', className: 'bg-green-100 text-green-700' },
  dirty: { label: '待清洁', className: 'bg-red-100 text-red-700' },
  cleaning: { label: '清洁中', className: 'bg-yellow-100 text-yellow-700' },
};

export const roomStatusLabels: Record<string, { label: string; className: string }> = {
  available: { label: '可用', className: 'bg-green-500' },
  occupied: { label: '使用中', className: 'bg-burgundy-600' },
  maintenance: { label: '维护中', className: 'bg-gray-500' },
};
