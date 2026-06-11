export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpired(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

export function isExpiringSoon(dateStr: string, days = 30): boolean {
  const d = daysUntil(dateStr);
  return d >= 0 && d <= days;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayStr(): string {
  return formatDate(new Date().toISOString());
}

export function addDaysStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDate(d.toISOString());
}

export function isThisMonth(timestamp: string): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
