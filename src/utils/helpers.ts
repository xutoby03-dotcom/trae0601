import type { User, Equipment, Mission, PackCheck, ReturnCheck, Battery, MemoryCard, MissionStatus, EquipmentStatus, EquipmentType } from '../types';
import { equipmentStatusLabels, missionStatusLabels, equipmentTypeLabels } from '../types';

export const shootingRecordTypeLabels: Record<string, string> = {
  battery_change: '电池更换',
  card_full: '存储卡已满',
};

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(d);
}

export function getUserName(userId: string, users: User[]): string {
  const user = users.find(u => u.id === userId);
  return user?.name || '未知';
}

export function getEquipmentById(id: string, equipment: Equipment[]): Equipment | undefined {
  return equipment.find(e => e.id === id);
}

export function getMissionById(id: string, missions: Mission[]): Mission | undefined {
  return missions.find(m => m.id === id);
}

export function calculateBatteryHealth(battery: Battery): string {
  const cycles = battery.chargeCycles;
  if (cycles < 100) return '优秀';
  if (cycles < 300) return '良好';
  if (cycles < 500) return '一般';
  return '较差';
}

export function getBatteryColor(charge: number): string {
  if (charge >= 80) return 'text-success';
  if (charge >= 50) return 'text-warning';
  if (charge >= 20) return 'text-warning';
  return 'text-danger';
}

export function getBatteryBgColor(charge: number): string {
  if (charge >= 80) return 'bg-success';
  if (charge >= 50) return 'bg-warning';
  if (charge >= 20) return 'bg-warning';
  return 'bg-danger';
}

export function getCardUsageColor(card: MemoryCard): string {
  const usagePercent = (card.usedCapacity / card.totalCapacity) * 100;
  if (usagePercent >= 90) return 'text-danger';
  if (usagePercent >= 70) return 'text-warning';
  return 'text-success';
}

export function countUnchargedBatteries(equipment: Equipment[]): number {
  let count = 0;
  equipment.forEach(eq => {
    eq.batteries.forEach(bat => {
      if (bat.chargeLevel < 100) count++;
    });
  });
  return count;
}

export function countMissingCards(equipment: Equipment[]): number {
  let count = 0;
  equipment.forEach(eq => {
    if (['camera', 'memory_card'].includes(eq.type) && eq.memoryCards.length === 0) {
      count++;
    }
  });
  return count;
}

export function countOverCapacityRisk(equipment: Equipment[]): number {
  let count = 0;
  equipment.forEach(eq => {
    eq.memoryCards.forEach(card => {
      const usagePercent = (card.usedCapacity / card.totalCapacity) * 100;
      if (usagePercent >= 80) count++;
    });
  });
  return count;
}

export function countPendingReturnChecks(returnChecks: ReturnCheck[]): number {
  let count = 0;
  returnChecks.forEach(rc => {
    rc.equipmentChecks.forEach(ec => {
      if (!ec.returned || ec.damage || ec.missing) count++;
    });
  });
  return count;
}

export function isPackCheckComplete(check: PackCheck): boolean {
  return check.batteryChecked && check.cardCapacityChecked && check.firmwareChecked &&
         check.chargerReady && check.spareCableReady;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
    case 'excellent':
    case 'completed':
    case 'good':
      return 'bg-success/20 text-success';
    case 'in_use':
    case 'shooting':
      return 'bg-primary/20 text-primary';
    case 'maintenance':
    case 'packing':
    case 'returning':
    case 'minor':
      return 'bg-warning/20 text-warning';
    case 'damaged':
    case 'lost':
    case 'poor':
    case 'draft':
    case 'damaged':
      return 'bg-danger/20 text-danger';
    default:
      return 'bg-neutral-700/50 text-neutral-300';
  }
}

export { equipmentTypeLabels, equipmentStatusLabels, missionStatusLabels };

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
