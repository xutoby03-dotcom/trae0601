export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

export const getDurationMinutes = (startIso: string, endIso?: string): number => {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  return Math.round((end - start) / 60000);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分` : `${h} 小时`;
};

export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
};

export const getNowIso = (): string => new Date().toISOString();

export const round = (n: number, d = 1): number => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

export const todayStr = (): string => new Date().toISOString().slice(0, 10);
