export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

export function today(): string {
  return formatDate(new Date());
}

export function isOverdue(dueDate: string): boolean {
  return dueDate < today();
}

export function isToday(dueDate: string): boolean {
  return dueDate === today();
}

export function isThisWeek(dueDate: string): boolean {
  const todayDate = new Date();
  const due = new Date(dueDate);
  const dayOfWeek = todayDate.getDay();
  const diffToSunday = 7 - dayOfWeek;
  const endOfWeek = new Date(todayDate);
  endOfWeek.setDate(todayDate.getDate() + diffToSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return due > todayDate && due <= endOfWeek;
}

export function getDaysRemaining(dueDate: string): number {
  const todayDate = new Date(today());
  const due = new Date(dueDate);
  const diffTime = due.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getRelativeDate(dueDate: string): string {
  const days = getDaysRemaining(dueDate);
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  if (days === 1) return '明天到期';
  if (days <= 7) return `${days} 天后到期`;
  return dueDate;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
