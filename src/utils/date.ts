export const WEIGHT_CHANGE_THRESHOLD = 0.1;

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}年${m}月${d}日`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = d2.getTime() - d1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr: string): number {
  return daysBetween(todayStr(), dateStr);
}

export type ReminderStatus = "overdue" | "urgent" | "upcoming" | "normal";

export function getReminderStatus(nextDate: string): ReminderStatus {
  const diff = daysUntil(nextDate);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "urgent";
  if (diff <= 7) return "upcoming";
  return "normal";
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months}个月`;
  }
  if (months === 0) {
    return `${years}岁`;
  }
  return `${years}岁${months}个月`;
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  );
}
