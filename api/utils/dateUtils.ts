export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function addDays(date: Date | string, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function daysFromNow(date: Date | string): number {
  return daysBetween(new Date(), date);
}

export function isExpired(expiryDate: Date | string): boolean {
  return daysFromNow(expiryDate) < 0;
}

export function isExpiring(expiryDate: Date | string, warningDays: number = 30): boolean {
  const days = daysFromNow(expiryDate);
  return days >= 0 && days <= warningDays;
}

export function getVaccineStatus(
  expiryDate: Date | string,
  warningDays: number = 30
): 'valid' | 'expiring' | 'expired' {
  if (isExpired(expiryDate)) {
    return 'expired';
  }
  if (isExpiring(expiryDate, warningDays)) {
    return 'expiring';
  }
  return 'valid';
}
