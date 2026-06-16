export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateChinese(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}月${day}日`;
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function isToday(dateStr: string): boolean {
  return formatDate(dateStr) === getToday();
}

export function isBefore(dateStr: string, compareDate: string = getToday()): boolean {
  return new Date(dateStr) < new Date(compareDate);
}

export function isAfter(dateStr: string, compareDate: string = getToday()): boolean {
  return new Date(dateStr) > new Date(compareDate);
}

export function getDaysFromNow(dateStr: string): number {
  const today = new Date(getToday());
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
