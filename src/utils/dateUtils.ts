export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addYears(dateString: string, years: number): string {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString();
}

export function isFloorLifeWarning(installDate: string): boolean {
  const lifeEnd = new Date(installDate);
  lifeEnd.setFullYear(lifeEnd.getFullYear() + 5);
  
  const now = new Date();
  const diffTime = lifeEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays < 180;
}

export function getFloorLifeRemaining(installDate: string): { years: number; months: number; days: number } {
  const lifeEnd = new Date(installDate);
  lifeEnd.setFullYear(lifeEnd.getFullYear() + 5);
  
  const now = new Date();
  const diff = lifeEnd.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { years: 0, months: 0, days: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;
  
  return { years, months, days: remainingDays };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
