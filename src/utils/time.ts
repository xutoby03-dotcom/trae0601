export const formatRelativeTime = (isoTime: string): string => {
  const now = new Date();
  const target = new Date(isoTime);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const absMins = Math.abs(diffMins);
    const absHours = Math.floor(absMins / 60);
    if (absMins < 60) return `${absMins}分钟后`;
    if (absHours < 24) return `${absHours}小时后`;
    return `${Math.floor(absHours / 24)}天后`;
  }

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  return `${diffDays}天前`;
};

export const formatDateTime = (isoTime: string): string => {
  const d = new Date(isoTime);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${month}月${day}日 ${hour}:${min}`;
};

export const formatTimeShort = (isoTime: string): string => {
  const d = new Date(isoTime);
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${hour}:${min}`;
};

export const getDurationHours = (startIso: string, endIso?: string): number => {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : new Date().getTime();
  return Math.round(((end - start) / 3600000) * 10) / 10;
};

export const isOverdue24h = (startIso: string): boolean => {
  const start = new Date(startIso).getTime();
  const now = new Date().getTime();
  return now - start > 24 * 60 * 60 * 1000;
};

export const isPastExpected = (expectedIso: string): boolean => {
  return new Date().getTime() > new Date(expectedIso).getTime();
};

export const getRemainingHours = (expectedIso: string): number => {
  const diff = new Date(expectedIso).getTime() - new Date().getTime();
  return Math.round((diff / 3600000) * 10) / 10;
};

export const getProgressPercent = (startIso: string, expectedIso: string): number => {
  const start = new Date(startIso).getTime();
  const expected = new Date(expectedIso).getTime();
  const now = new Date().getTime();
  if (expected <= start) return 100;
  const total = expected - start;
  const elapsed = now - start;
  const percent = (elapsed / total) * 100;
  return Math.max(0, Math.min(100, percent));
};

export const genId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

export const nowIso = (): string => new Date().toISOString();

export const hoursFromNowIso = (hours: number): string =>
  new Date(new Date().getTime() + hours * 3600000).toISOString();
