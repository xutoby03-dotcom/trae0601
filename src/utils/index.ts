import dayjs from 'dayjs';
import {
  BorrowRecord,
  InventoryItem,
  MedicineBox,
  Reminder,
} from '@/types';
import { EXPIRY_WARNING_DAYS, LOW_STOCK_THRESHOLD } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function daysUntil(date: string): number {
  return dayjs(date).endOf('day').diff(dayjs().endOf('day'), 'day');
}

export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

export function isExpired(expiryDate: string): boolean {
  return dayjs(expiryDate).isBefore(dayjs(), 'day');
}

export function isExpiringSoon(expiryDate: string): boolean {
  const days = daysUntil(expiryDate);
  return days >= 0 && days <= EXPIRY_WARNING_DAYS;
}

export function isLowStock(quantity: number): boolean {
  return quantity <= LOW_STOCK_THRESHOLD;
}

export function computeItemStatus(item: InventoryItem): InventoryItem['status'] {
  if (isExpired(item.expiryDate)) return 'expired';
  if (item.quantity <= 0) return 'damaged';
  if (isLowStock(item.quantity)) return 'low-stock';
  return 'normal';
}

export function computeBorrowStatus(record: BorrowRecord): BorrowRecord['status'] {
  if (record.actualReturnDate) return 'returned';
  if (dayjs(record.expectedReturnDate).isBefore(dayjs(), 'day')) return 'overdue';
  return 'borrowing';
}

export function getBoxName(boxId: string, boxes: MedicineBox[]): string {
  return boxes.find(b => b.id === boxId)?.location ?? '未知位置';
}

export function generateReminders(
  items: InventoryItem[],
  borrows: BorrowRecord[]
): Reminder[] {
  const reminders: Reminder[] = [];
  const now = dayjs().toISOString();

  items.forEach(item => {
    if (isExpired(item.expiryDate)) {
      reminders.push({
        id: generateId(),
        type: 'expiry',
        relatedId: item.id,
        title: item.name + ' 已过期',
        description: '存放格: ' + item.storageCell + '，请及时更换过期物品',
        level: 'danger',
        isRead: false,
        createdAt: now,
      });
    } else if (isExpiringSoon(item.expiryDate)) {
      reminders.push({
        id: generateId(),
        type: 'expiry',
        relatedId: item.id,
        title: item.name + ' 即将过期',
        description: '距离过期还有 ' + daysUntil(item.expiryDate) + ' 天',
        level: 'warning',
        isRead: false,
        createdAt: now,
      });
    }

    if (item.status === 'damaged') {
      reminders.push({
        id: generateId(),
        type: 'damage',
        relatedId: item.id,
        title: item.name + ' 已破损',
        description: '存放格: ' + item.storageCell + '，请及时处理或更换',
        level: 'danger',
        isRead: false,
        createdAt: now,
      });
    }

    if (isLowStock(item.quantity) && item.status !== 'damaged') {
      reminders.push({
        id: generateId(),
        type: 'low-stock',
        relatedId: item.id,
        title: item.name + ' 库存不足',
        description: '当前库存: ' + item.quantity + '，建议及时补货',
        level: item.quantity <= 2 ? 'danger' : 'warning',
        isRead: false,
        createdAt: now,
      });
    }
  });

  borrows.forEach(record => {
    if (!record.actualReturnDate && dayjs(record.expectedReturnDate).isBefore(dayjs(), 'day')) {
      reminders.push({
        id: generateId(),
        type: 'overdue-return',
        relatedId: record.id,
        title: record.residentName + ' 逾期未还',
        description: '物品: ' + record.itemName + '，已逾期 ' + Math.abs(daysUntil(record.expectedReturnDate)) + ' 天',
        level: 'danger',
        isRead: false,
        createdAt: now,
      });
    }
  });

  return reminders;
}
