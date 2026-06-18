import type { Shelf, PackageItem, ExceptionRecord, ReminderLog, ShelfSlot } from '@/types';
import { generateId, generatePickupCode, getSlotLabel } from '@/utils';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400 * 1000).toISOString();

export const MOCK_SHELVES: Shelf[] = [
  {
    id: 'shelf-001',
    name: '东门快递架A',
    area: '小区东门岗亭旁',
    floorCount: 4,
    slotsPerFloor: 6,
    cameraPoint: 'CAM-DM-001',
    manager: '张建国',
    managerPhone: '13800138001',
    createdAt: daysAgo(30),
  },
  {
    id: 'shelf-002',
    name: '西门快递架B',
    area: '小区西门物业前',
    floorCount: 5,
    slotsPerFloor: 8,
    cameraPoint: 'CAM-XM-002',
    manager: '李秀英',
    managerPhone: '13800138002',
    createdAt: daysAgo(25),
  },
  {
    id: 'shelf-003',
    name: '北门快递架C',
    area: '小区北门地下车库入口',
    floorCount: 3,
    slotsPerFloor: 5,
    cameraPoint: 'CAM-BM-003',
    manager: '王德发',
    managerPhone: '13800138003',
    createdAt: daysAgo(20),
  },
];

export function generateShelfSlots(shelf: Shelf): ShelfSlot[] {
  const slots: ShelfSlot[] = [];
  for (let floor = 1; floor <= shelf.floorCount; floor++) {
    for (let slot = 1; slot <= shelf.slotsPerFloor; slot++) {
      const sizeRoll = Math.random();
      const size = sizeRoll < 0.5 ? 'M' : sizeRoll < 0.8 ? 'S' : 'L';
      slots.push({
        id: `${shelf.id}-slot-${floor}-${slot}`,
        shelfId: shelf.id,
        floor,
        slotNumber: slot,
        sizeLevel: size as 'S' | 'M' | 'L',
        isOccupied: false,
      });
    }
  }
  return slots;
}

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1568057373531-6e8fd66a8db5?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1612392062186-4bb2eab4fb8b?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1606787997632-4464c8028742?w=200&h=200&fit=crop',
];

const NAMES = ['王伟', '李娜', '张伟', '刘洋', '陈静', '杨帆', '黄磊', '周敏', '吴强', '郑芳', '孙磊', '马丽', '朱峰', '胡婷', '林涛'];

const COURIERS = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '申通快递', '韵达快递', '极兔速递', '邮政EMS'];

const SIZES: Array<'S' | 'M' | 'L'> = ['S', 'M', 'L'];

function createPackage(
  shelfId: string,
  shelfSlotId: string,
  floor: number,
  slotNumber: number,
  storedHoursAgo: number,
  status: 'stored' | 'picked' = 'stored',
): PackageItem {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  return {
    id: generateId(),
    shelfId,
    shelfSlotId,
    slotLabel: getSlotLabel(floor, slotNumber),
    recipientName: name,
    phoneLast4: String(Math.floor(1000 + Math.random() * 9000)),
    courierCompany: COURIERS[Math.floor(Math.random() * COURIERS.length)],
    packageSize: SIZES[Math.floor(Math.random() * SIZES.length)],
    photoUrl: PHOTO_URLS[Math.floor(Math.random() * PHOTO_URLS.length)],
    storedAt: hoursAgo(storedHoursAgo),
    status,
    pickupCode: generatePickupCode(),
    pickedAt: status === 'picked' ? hoursAgo(storedHoursAgo - Math.random() * 12) : undefined,
    pickupName: status === 'picked' ? name : undefined,
  };
}

export const MOCK_PACKAGES: PackageItem[] = [
  // 正常: < 24h
  createPackage('shelf-001', 'shelf-001-slot-1-1', 1, 1, 2),
  createPackage('shelf-001', 'shelf-001-slot-1-2', 1, 2, 5),
  createPackage('shelf-001', 'shelf-001-slot-1-3', 1, 3, 8),
  createPackage('shelf-001', 'shelf-001-slot-2-1', 2, 1, 12),
  createPackage('shelf-001', 'shelf-001-slot-2-2', 2, 2, 18),
  createPackage('shelf-002', 'shelf-002-slot-1-1', 1, 1, 3),
  createPackage('shelf-002', 'shelf-002-slot-1-2', 1, 2, 6),
  createPackage('shelf-002', 'shelf-002-slot-2-1', 2, 1, 10),
  createPackage('shelf-003', 'shelf-003-slot-1-1', 1, 1, 4),
  createPackage('shelf-003', 'shelf-003-slot-1-2', 1, 2, 9),

  // 一级滞留: 24-48h
  createPackage('shelf-001', 'shelf-001-slot-3-1', 3, 1, 26),
  createPackage('shelf-001', 'shelf-001-slot-3-2', 3, 2, 30),
  createPackage('shelf-002', 'shelf-002-slot-3-1', 3, 1, 28),
  createPackage('shelf-002', 'shelf-002-slot-3-2', 3, 2, 35),
  createPackage('shelf-003', 'shelf-003-slot-2-1', 2, 1, 32),

  // 二级滞留: 48-72h
  createPackage('shelf-001', 'shelf-001-slot-4-1', 4, 1, 50),
  createPackage('shelf-001', 'shelf-001-slot-4-2', 4, 2, 55),
  createPackage('shelf-002', 'shelf-002-slot-4-1', 4, 1, 60),
  createPackage('shelf-003', 'shelf-003-slot-3-1', 3, 1, 48),

  // 三级滞留: >= 72h
  createPackage('shelf-001', 'shelf-001-slot-4-3', 4, 3, 80),
  createPackage('shelf-002', 'shelf-002-slot-5-1', 5, 1, 96),
  createPackage('shelf-002', 'shelf-002-slot-5-2', 5, 2, 120),

  // 已取件
  createPackage('shelf-001', 'shelf-001-slot-1-4', 1, 4, 15, 'picked'),
  createPackage('shelf-001', 'shelf-001-slot-1-5', 1, 5, 22, 'picked'),
  createPackage('shelf-001', 'shelf-001-slot-2-3', 2, 3, 28, 'picked'),
  createPackage('shelf-001', 'shelf-001-slot-3-3', 3, 3, 33, 'picked'),
  createPackage('shelf-002', 'shelf-002-slot-1-3', 1, 3, 8, 'picked'),
  createPackage('shelf-002', 'shelf-002-slot-2-2', 2, 2, 14, 'picked'),
  createPackage('shelf-002', 'shelf-002-slot-2-3', 2, 3, 20, 'picked'),
  createPackage('shelf-002', 'shelf-002-slot-3-3', 3, 3, 36, 'picked'),
  createPackage('shelf-003', 'shelf-003-slot-1-3', 1, 3, 11, 'picked'),
  createPackage('shelf-003', 'shelf-003-slot-2-2', 2, 2, 25, 'picked'),
];

export const MOCK_EXCEPTIONS: ExceptionRecord[] = [
  {
    id: generateId(),
    packageId: 'mock-exception-1',
    recipientName: '赵小刚',
    slotLabel: '1层-05格',
    type: 'damaged',
    description: '包裹外包装箱角有明显破损，内部物品疑似受损，已拍照留证',
    handler: '张建国',
    createdAt: hoursAgo(3),
  },
  {
    id: generateId(),
    packageId: 'mock-exception-2',
    recipientName: '钱小美',
    slotLabel: '2层-03格',
    type: 'wrong_pickup',
    description: '居民取走了他人包裹，已通过监控查到，正联系追回',
    handler: '李秀英',
    createdAt: hoursAgo(8),
  },
];

export const MOCK_REMINDERS: ReminderLog[] = [
  {
    id: generateId(),
    packageId: 'mock-reminder-1',
    recipientName: '孙磊',
    slotLabel: '4层-01格',
    type: 'auto_24h',
    level: 'warning',
    remindedAt: hoursAgo(26),
    result: '系统自动发送短信提醒',
  },
  {
    id: generateId(),
    packageId: 'mock-reminder-2',
    recipientName: '马丽',
    slotLabel: '5层-02格',
    type: 'auto_24h',
    level: 'warning',
    remindedAt: hoursAgo(98),
    result: '系统自动发送短信提醒',
  },
  {
    id: generateId(),
    packageId: 'mock-reminder-3',
    recipientName: '马丽',
    slotLabel: '5层-02格',
    type: 'auto_48h',
    level: 'danger',
    remindedAt: hoursAgo(74),
    result: '系统再次提醒，通知保安留意',
  },
  {
    id: generateId(),
    packageId: 'mock-reminder-4',
    recipientName: '马丽',
    slotLabel: '5层-02格',
    type: 'manual_72h',
    level: 'critical',
    remindedAt: hoursAgo(2),
    operator: '李秀英',
    result: '电话无人接听，已移至物业待处理区',
  },
];
