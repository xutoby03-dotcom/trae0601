import { TeaBatch, TeaJar, AlertItem } from '@/types';
import { daysBetween, addDays, nowISO } from './date';
import { generateId } from './storage';

export function calculateAlerts(batches: TeaBatch[], jars: TeaJar[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  const batchMap = new Map(batches.map(b => [b.id, b]));

  jars.forEach(jar => {
    if (jar.status === 'sold' || jar.status === 'damaged') return;

    const batch = batchMap.get(jar.batchId);
    if (!batch) return;

    const expiryDate = addDays(batch.purchaseDate, batch.shelfLifeDays);
    const daysToExpiry = daysBetween(nowISO(), expiryDate);

    if (daysToExpiry <= 30) {
      alerts.push({
        id: generateId(),
        type: 'expiry',
        level: daysToExpiry <= 7 ? 'danger' : 'warning',
        jarId: jar.id,
        jarNo: jar.jarNo,
        batchName: batch.name,
        message: daysToExpiry > 0 ? `距保质期还有 ${daysToExpiry} 天` : `已过期 ${Math.abs(daysToExpiry)} 天`,
        daysLeft: daysToExpiry,
      });
    }

    if (jar.status === 'open' && jar.openedAt) {
      const daysOpen = daysBetween(jar.openedAt, nowISO());
      if (daysOpen >= 15) {
        alerts.push({
          id: generateId(),
          type: 'openTooLong',
          level: daysOpen >= 30 ? 'danger' : 'warning',
          jarId: jar.id,
          jarNo: jar.jarNo,
          batchName: batch.name,
          message: `已开罐 ${daysOpen} 天，建议尽快售完`,
          daysLeft: daysOpen,
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    if (a.level !== b.level) return a.level === 'danger' ? -1 : 1;
    return a.daysLeft - b.daysLeft;
  });
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    sealed: '封存中',
    open: '已开罐',
    sold: '已售完',
    damaged: '已报损',
  };
  return map[status] || status;
}

export function getSealLabel(status: string): string {
  const map: Record<string, string> = {
    good: '良好',
    normal: '一般',
    poor: '需更换',
  };
  return map[status] || status;
}

export function getOperationLabel(type: string): string {
  const map: Record<string, string> = {
    seal: '封罐',
    open: '开罐',
    sale: '售卖',
    refill: '补罐',
    damage: '报损',
  };
  return map[type] || type;
}

export function getDamageLabel(reason: string): string {
  const map: Record<string, string> = {
    moisture: '受潮',
    deterioration: '变质',
    other: '其他',
  };
  return map[reason] || reason;
}
