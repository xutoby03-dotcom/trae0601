import { LendingRecord, Device, DailyStats } from '../types';
import { compensationStandards } from './mock';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(expectedReturnDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedReturnDate);
  expected.setHours(0, 0, 0, 0);
  return expected < today;
}

export function getDeviceStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    available: '可借',
    lent: '借出中',
    maintenance: '维护中',
    low_battery: '低电量待充',
  };
  return statusMap[status] || status;
}

export function getLendingStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    active: '借出中',
    returned: '已归还',
    overdue: '超时未还',
  };
  return statusMap[status] || status;
}

export function getCompensationStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    pending: '待处理',
    paid: '已赔付',
    waived: '已豁免',
  };
  return statusMap[status] || status;
}

export function calculateCompensation(
  missingAccessories: string[],
  cableOk: boolean,
  shellOk: boolean,
  returnBattery: number
): { amount: number; reason: string } {
  let amount = 0;
  const reasons: string[] = [];

  missingAccessories.forEach((item) => {
    if (compensationStandards[item]) {
      amount += compensationStandards[item];
      reasons.push(`缺失${item}`);
    }
  });

  if (!cableOk) {
    amount += compensationStandards['充电线'] || 20;
    reasons.push('充电线损坏');
  }

  if (!shellOk) {
    amount += compensationStandards['外壳破损'] || 50;
    reasons.push('外壳破损');
  }

  if (returnBattery < 20) {
    amount += compensationStandards['电量过低'] || 10;
    reasons.push('电量过低');
  }

  return {
    amount,
    reason: reasons.join('、'),
  };
}

export function getWeeklyStats(records: LendingRecord[]): DailyStats[] {
  const stats: DailyStats[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

    const count = records.filter((r) => {
      const lendDate = new Date(r.lendDate).toISOString().split('T')[0];
      return lendDate === dateStr;
    }).length;

    stats.push({
      date: `周${dayName}`,
      count,
    });
  }

  return stats;
}

export function getAvailableCount(devices: Device[], records: LendingRecord[]): number {
  const lentDeviceIds = records
    .filter((r) => r.status === 'active' || r.status === 'overdue')
    .map((r) => r.deviceId);

  return devices.filter(
    (d) => d.status === 'available' && !lentDeviceIds.includes(d.id)
  ).length;
}

export function getOverdueCount(records: LendingRecord[]): number {
  return records.filter((r) => r.status === 'overdue').length;
}

export function getLowBatteryCount(devices: Device[]): number {
  return devices.filter((d) => d.status === 'low_battery' || (d.status === 'available' && d.currentBattery < 20)).length;
}

export function getWeeklyLendingCount(records: LendingRecord[]): number {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return records.filter((r) => {
    const lendDate = new Date(r.lendDate);
    return lendDate >= weekAgo && lendDate <= today;
  }).length;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDefaultReturnDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0];
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}
