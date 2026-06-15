export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(d);
    newDate.setDate(d.getDate() + i);
    dates.push(newDate);
  }
  return dates;
}

export function getWeekRange(baseDate: Date = new Date()): { start: string; end: string } {
  const weekDates = getWeekDates(baseDate);
  return {
    start: formatDate(weekDates[0]),
    end: formatDate(weekDates[6]),
  };
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
