export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isToday = (isoString: string): boolean => {
  const date = new Date(isoString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const isOvertime = (expectedLeaveTime: string): boolean => {
  return new Date(expectedLeaveTime).getTime() < Date.now();
};

export const getCountdown = (expectedLeaveTime: string): string => {
  const diff = new Date(expectedLeaveTime).getTime() - Date.now();
  if (diff <= 0) {
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `超时 ${hours}时${minutes}分`;
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}时${minutes}分`;
};

export const getDuration = (start: string, end?: string): string => {
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diff = endTime - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}时${minutes}分`;
};

export const getDurationMs = (start: string, end?: string): number => {
  const endTime = end ? new Date(end).getTime() : Date.now();
  return endTime - new Date(start).getTime();
};

export const getAverageDuration = (durations: number[]): string => {
  if (durations.length === 0) return '0时0分';
  const total = durations.reduce((a, b) => a + b, 0) / durations.length;
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}时${minutes}分`;
};

export const addHours = (date: Date, hours: number): string => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
};

export const getTodayISO = (): string => {
  const now = new Date();
  return now.toISOString();
};

export const formatDateForInput = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const parseFromInput = (value: string): string => {
  return new Date(value).toISOString();
};
