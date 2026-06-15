export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 0) {
    const absMins = Math.abs(diffMins);
    if (absMins < 60) return `${absMins}分钟前`;
    const hours = Math.floor(absMins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  }
  
  if (diffMins < 60) return `${diffMins}分钟后`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours}小时后`;
  const days = Math.floor(hours / 24);
  return `${days}天后`;
}

export function getExpiryTime(endTime: string, edibleHours: number): Date {
  const end = new Date(endTime);
  return new Date(end.getTime() + edibleHours * 60 * 60 * 1000);
}

export function getRemainingTime(endTime: string, edibleHours: number): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  isExpired: boolean;
} {
  const expiry = getExpiryTime(endTime, edibleHours);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const totalMinutes = Math.round(diffMs / 60000);
  
  if (totalMinutes <= 0) {
    return { hours: 0, minutes: 0, totalMinutes: 0, isExpired: true };
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalMinutes, isExpired: false };
}

export function isSafeToTakeToday(endTime: string, edibleHours: number): boolean {
  const expiry = getExpiryTime(endTime, edibleHours);
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return expiry.getTime() > now.getTime() && expiry.getTime() <= endOfDay.getTime();
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
