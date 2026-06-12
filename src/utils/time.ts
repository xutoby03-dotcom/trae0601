import type { CountdownStatus } from '@/types';

export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hrs === 0) return `${mins}分钟`;
  if (mins === 0) return `${hrs}小时`;
  return `${hrs}小时${mins}分`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function calcRemainingSeconds(startTime: string, targetSeconds: number): number {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000);
  return targetSeconds - elapsed;
}

export function getCountdownStatus(remaining: number, total: number): CountdownStatus {
  if (remaining <= 0) return 'overtime';
  const ratio = remaining / total;
  if (ratio <= 0.1) return 'danger';
  if (ratio <= 0.2) return 'warning';
  return 'normal';
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
