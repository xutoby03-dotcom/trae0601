export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

export function formatDate(dateStr: string, format: 'full' | 'short' | 'cn' = 'cn'): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'full':
      return `${y}-${m}-${d} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    case 'short':
      return `${m}/${d}`;
    case 'cn':
      return `${y}年${m}月${d}日`;
  }
}

export function daysBetween(start: string, end: string = new Date().toISOString()): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr: string): number {
  return daysBetween(new Date().toISOString(), dateStr);
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
