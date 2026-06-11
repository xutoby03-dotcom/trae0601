export const genId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const daysBetween = (dateStr1: string, dateStr2: string = new Date().toISOString()): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (createdAt: string, dueDays: number): boolean => {
  return daysBetween(createdAt) > dueDays;
};

export const getOverdueDays = (createdAt: string, dueDays: number): number => {
  const passed = daysBetween(createdAt);
  return Math.max(0, passed - dueDays);
};

export const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#ff6348', '#7bed9f', '#eccc68'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
