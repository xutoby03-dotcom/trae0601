export function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export function getHourFromTime(dateStr: string): number {
  if (!dateStr) return 0;
  return new Date(dateStr).getHours();
}

export function getMinuteFromTime(dateStr: string): number {
  if (!dateStr) return 0;
  return new Date(dateStr).getMinutes();
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getTimeDiffInMinutes(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60));
}

export function generateTimeRange(startHour: number, endHour: number): number[] {
  const hours: number[] = [];
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i);
  }
  return hours;
}

export function getCountdownText(targetDateStr: string): string {
  const now = new Date().getTime();
  const target = new Date(targetDateStr).getTime();
  const diff = target - now;

  if (diff <= 0) return '已开始';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}天${hours}小时`;
  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}
