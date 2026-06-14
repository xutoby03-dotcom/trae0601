import type { BoardGroup, Visitor } from '@/types';

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfTomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfTomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(dateStr: string, target: Date): boolean {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
}

export function formatDate(date: Date | string, withTime = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分钟`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

export function getBoardGroup(visitor: Visitor, ticketUsed: boolean): BoardGroup {
  const arrival = new Date(visitor.expectedArrival);
  const departure = new Date(visitor.expectedDeparture);
  const now = new Date();

  const isOverdue = (departure < now || arrival < startOfToday()) && !ticketUsed && visitor.status !== 'left';
  if (isOverdue) return 'overdue';
  if (isSameDay(visitor.expectedArrival, startOfToday())) return 'today';
  if (isSameDay(visitor.expectedArrival, startOfTomorrow())) return 'tomorrow';
  if (arrival < startOfToday() && !ticketUsed && visitor.status !== 'left') return 'overdue';
  return 'today';
}

export function isWithinReminderWindow(expectedDeparture: string, minutes = 30): boolean {
  const dep = new Date(expectedDeparture).getTime();
  const now = Date.now();
  const threshold = dep - minutes * 60 * 1000;
  return now >= threshold && now <= dep;
}

export function hoursBetween(start: string, end: string): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, diff / (1000 * 60 * 60));
}

export function getTodayDateTimeLocal(offsetHours = 1): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + offsetHours);
  return toLocalInputFormat(d);
}

export function getEndOfDayDateTimeLocal(): string {
  const d = new Date();
  d.setHours(18, 0, 0, 0);
  return toLocalInputFormat(d);
}

export function toLocalInputFormat(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export function friendlyDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = startOfToday();
  const tomorrow = startOfTomorrow();
  if (isSameDay(dateStr, today)) return `今天 ${formatTime(dateStr)}`;
  if (isSameDay(dateStr, tomorrow)) return `明天 ${formatTime(dateStr)}`;
  return formatDate(dateStr, true);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${hh}:${mm}`;
}
