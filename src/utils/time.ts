export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

export function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string; isNegative: boolean } {
  const isNegative = ms < 0;
  const absMs = Math.abs(ms);
  const totalSeconds = Math.floor(absMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    isNegative,
  };
}

export function getTimeRemaining(targetTime: string | Date): number {
  const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
  return target.getTime() - Date.now();
}

export function calculateProgress(startTime: string | Date, targetTime: string | Date): number {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
  const now = Date.now();
  const total = target.getTime() - start.getTime();
  const elapsed = now - start.getTime();
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

export function addMinutes(date: Date | string, minutes: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date | string, hours: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export function getBatchStatus(
  startTime: string,
  targetFilterTime: string,
  isFiltered: boolean,
  isOffShelf: boolean,
  shelfTime?: string,
  shelfLifeHours?: number
): 'brewing' | 'ready' | 'overdue' | 'filtered' | 'off_shelf' {
  if (isOffShelf) return 'off_shelf';
  
  if (isFiltered) {
    if (shelfTime && shelfLifeHours) {
      const shelfLifeMs = shelfLifeHours * 60 * 60 * 1000;
      const shelfDate = new Date(shelfTime);
      if (Date.now() - shelfDate.getTime() > shelfLifeMs) {
        return 'off_shelf';
      }
    }
    return 'filtered';
  }
  
  const now = Date.now();
  const target = new Date(targetFilterTime).getTime();
  const readyThreshold = target - 10 * 60 * 1000;
  
  if (now >= target) return 'overdue';
  if (now >= readyThreshold) return 'ready';
  return 'brewing';
}
