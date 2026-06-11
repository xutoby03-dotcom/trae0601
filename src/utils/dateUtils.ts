export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function padZero(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatDateTime(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    padZero(date.getMonth() + 1) +
    "-" +
    padZero(date.getDate()) +
    " " +
    padZero(date.getHours()) +
    ":" +
    padZero(date.getMinutes())
  );
}

export function formatDate(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    padZero(date.getMonth() + 1) +
    "-" +
    padZero(date.getDate())
  );
}

export function formatDateTimeLocal(date: Date): string {
  return (
    date.getFullYear() +
    "-" +
    padZero(date.getMonth() + 1) +
    "-" +
    padZero(date.getDate()) +
    "T" +
    padZero(date.getHours()) +
    ":" +
    padZero(date.getMinutes())
  );
}

export function parseDateTimeLocal(str: string): string {
  return str.replace("T", " ");
}

export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d;
}

export function addDays(date: Date, days: number, hours = 0): Date {
  const d = new Date(date);
  d.setTime(d.getTime() + (days * 24 + hours) * 60 * 60 * 1000);
  return d;
}

export function getDateDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export function isOverdue(expectedReturnTime: string): boolean {
  return new Date(expectedReturnTime).getTime() < Date.now();
}

export function isSoonOverdue(
  expectedReturnTime: string,
  thresholdHours = 2
): boolean {
  const expected = new Date(expectedReturnTime).getTime();
  const now = Date.now();
  const threshold = thresholdHours * 60 * 60 * 1000;
  return now < expected && expected - now < threshold;
}

export function getRemainingTime(expectedReturnTime: string): string {
  const diff = new Date(expectedReturnTime).getTime() - Date.now();
  if (diff <= 0) return "已超时";
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const h = hours % 24;
    return `${days}天${h}小时`;
  }
  return `${hours}小时${minutes}分钟`;
}
