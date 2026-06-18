export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getRemainingTime = (targetTime: Date | string): { hours: number; minutes: number; totalMinutes: number } => {
  const target = new Date(targetTime).getTime();
  const now = Date.now();
  const diff = target - now;
  const totalMinutes = Math.max(0, Math.floor(diff / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
};

export const isWithinNextHours = (targetTime: Date | string, hours: number): boolean => {
  const target = new Date(targetTime).getTime();
  const now = Date.now();
  const diff = target - now;
  return diff > 0 && diff <= hours * 60 * 60 * 1000;
};

export const addHours = (date: Date | string, hours: number): Date => {
  const d = new Date(date);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d;
};
