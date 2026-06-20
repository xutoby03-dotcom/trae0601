import { PICKUP_SLOT_LABELS, TEMP_ZONE_LABELS, type PickupSlot, type TempZone, type OrderStatus } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPickupSlotLabel(slot: PickupSlot): string {
  return PICKUP_SLOT_LABELS[slot];
}

export function getTempZoneLabel(zone: TempZone): string {
  return TEMP_ZONE_LABELS[zone];
}

export function isTempAbnormal(tempZone: TempZone, temperature: number): boolean {
  if (tempZone === 'frozen') return temperature > -18;
  if (tempZone === 'refrigerated') return temperature < 0 || temperature > 4;
  return false;
}

export function getTempStatusColor(tempZone: TempZone, temperature: number): string {
  if (isTempAbnormal(tempZone, temperature)) {
    return 'text-red-500';
  }
  if (tempZone === 'frozen') return 'text-sky-500';
  if (tempZone === 'refrigerated') return 'text-cyan-500';
  return 'text-stone-500';
}

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    case 'picked':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    case 'timeout':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
  }
}

export function getPickupSlotEndTime(slot: PickupSlot, baseDate: Date = new Date()): Date {
  const date = new Date(baseDate);
  const endTimes: Record<PickupSlot, number> = {
    morning: 12,
    noon: 14,
    afternoon: 18,
    evening: 21,
  };
  date.setHours(endTimes[slot], 0, 0, 0);
  return date;
}

export function isOrderTimedOut(
  pickupSlot: PickupSlot,
  arrivalTime: string,
  currentTime: Date = new Date()
): boolean {
  const arrival = new Date(arrivalTime);
  const slotEnd = getPickupSlotEndTime(pickupSlot, arrival);
  return currentTime > slotEnd;
}

export function timeRemaining(
  pickupSlot: PickupSlot,
  arrivalTime: string,
  currentTime: Date = new Date()
): string {
  const arrival = new Date(arrivalTime);
  const slotEnd = getPickupSlotEndTime(pickupSlot, arrival);
  const diff = slotEnd.getTime() - currentTime.getTime();

  if (diff <= 0) return '已超时';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}小时${minutes}分钟`;
  return `${minutes}分钟`;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
