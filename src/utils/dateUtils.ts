export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function addHours(iso: string, hours: number): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function daysBetween(from: string, to: string): number {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return Math.floor((t - f) / (1000 * 60 * 60 * 24));
}

export function hoursBetween(from: string, to: string): number {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return Math.floor((t - f) / (1000 * 60 * 60));
}

export function getOverdueDays(dueTime: string, now: string = new Date().toISOString()): number {
  const due = new Date(dueTime).getTime();
  const n = new Date(now).getTime();
  if (n <= due) return 0;
  return Math.ceil((n - due) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueTime: string, now: string = new Date().toISOString()): boolean {
  return new Date(now).getTime() > new Date(dueTime).getTime();
}

export function getHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function timeAgo(iso: string): string {
  const now = new Date().getTime();
  const t = new Date(iso).getTime();
  const diffMs = now - t;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  return formatDate(iso);
}
