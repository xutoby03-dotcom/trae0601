import type { Box, CleaningRecord, MaintenanceRecord, Rider, UsageLog, Order } from '../types';
import { generateId } from '../utils/helpers';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/storage';

const mockRiders: Rider[] = [
  {
    id: 'rider-1',
    name: '张三',
    phone: '13800138001',
    employeeId: 'EMP001',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'rider-2',
    name: '李四',
    phone: '13800138002',
    employeeId: 'EMP002',
    createdAt: '2025-01-20T09:00:00Z',
  },
  {
    id: 'rider-3',
    name: '王五',
    phone: '13800138003',
    employeeId: 'EMP003',
    createdAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'rider-4',
    name: '赵六',
    phone: '13800138004',
    employeeId: 'EMP004',
    createdAt: '2025-02-10T09:00:00Z',
  },
  {
    id: 'rider-5',
    name: '孙七',
    phone: '13800138005',
    employeeId: 'EMP005',
    createdAt: '2025-02-15T09:00:00Z',
  },
];

const mockBoxes: Box[] = [
  {
    id: 'box-1',
    boxNumber: 'BX-001',
    capacity: 30,
    usageType: 'hot_food',
    riderId: 'rider-1',
    purchaseDate: '2026-01-15',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20food%20delivery%20insulated%20box%20front%20view%20white%20background&image_size=square',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'box-2',
    boxNumber: 'BX-002',
    capacity: 25,
    usageType: 'cold_drink',
    riderId: 'rider-2',
    purchaseDate: '2026-02-01',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20cold%20drink%20delivery%20cooler%20box%20front%20view%20white%20background&image_size=square',
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'box-3',
    boxNumber: 'BX-003',
    capacity: 40,
    usageType: 'mixed',
    riderId: 'rider-3',
    purchaseDate: '2025-12-01',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gray%20large%20food%20delivery%20box%20mixed%20use%20front%20view%20white%20background&image_size=square',
    status: 'active',
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'box-4',
    boxNumber: 'BX-004',
    capacity: 30,
    usageType: 'hot_food',
    riderId: 'rider-4',
    purchaseDate: '2025-11-15',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20hot%20food%20delivery%20bag%20insulated%20front%20view%20white%20background&image_size=square',
    status: 'pending_cleaning',
    createdAt: '2025-11-15T09:00:00Z',
  },
  {
    id: 'box-5',
    boxNumber: 'BX-005',
    capacity: 35,
    usageType: 'mixed',
    riderId: 'rider-5',
    purchaseDate: '2025-10-01',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20premium%20food%20delivery%20box%20front%20view%20white%20background&image_size=square',
    status: 'maintenance',
    createdAt: '2025-10-01T09:00:00Z',
  },
  {
    id: 'box-6',
    boxNumber: 'BX-006',
    capacity: 28,
    usageType: 'hot_food',
    riderId: 'rider-1',
    purchaseDate: '2025-08-01',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20worn%20food%20delivery%20box%20front%20view%20white%20background&image_size=square',
    status: 'active',
    createdAt: '2025-08-01T09:00:00Z',
  },
  {
    id: 'box-7',
    boxNumber: 'BX-007',
    capacity: 32,
    usageType: 'cold_drink',
    riderId: 'rider-2',
    purchaseDate: '2026-03-01',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=light%20blue%20new%20cooler%20box%20for%20drinks%20front%20view%20white%20background&image_size=square',
    status: 'active',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'box-8',
    boxNumber: 'BX-008',
    capacity: 38,
    usageType: 'mixed',
    riderId: 'rider-3',
    purchaseDate: '2025-09-15',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20green%20food%20delivery%20box%20front%20view%20white%20background&image_size=square',
    status: 'scrapped',
    createdAt: '2025-09-15T09:00:00Z',
  },
];

function generateCleaningRecords(): CleaningRecord[] {
  const records: CleaningRecord[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    mockBoxes.forEach((box, boxIndex) => {
      if (box.status === 'scrapped') return;

      const randomFactor = Math.random();
      const isFullyCleaned = randomFactor > 0.15;
      const isPartial = randomFactor > 0.05 && randomFactor <= 0.15;

      if (isFullyCleaned || isPartial) {
        records.push({
          id: generateId(),
          boxId: box.id,
          cleaningDate: dateStr,
          residueRemoved: true,
          interiorWiped: true,
          disinfected: isFullyCleaned,
          dried: isFullyCleaned,
          zipperChecked: isFullyCleaned,
          odorChecked: isFullyCleaned,
          remarks: isFullyCleaned ? '' : '消毒和晾干步骤待完成',
          cleanedBy: mockRiders[boxIndex % mockRiders.length].name,
          createdAt: `${dateStr}T08:${30 + boxIndex * 5}:00Z`,
        });
      }
    });
  }

  return records;
}

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    boxId: 'box-5',
    issueType: 'damage',
    description: '箱角有明显破损，拉链轨道变形',
    status: 'in_progress',
    resolution: '已申请更换拉链和修复箱角',
    reportedDate: '2026-06-15',
    resolvedDate: '',
    reportedBy: '孙七',
  },
  {
    id: 'maint-2',
    boxId: 'box-3',
    issueType: 'odor',
    description: '内部有异味，可能是之前洒的汤没清理干净',
    status: 'repaired',
    resolution: '已进行深度清洁和消毒处理',
    reportedDate: '2026-06-10',
    resolvedDate: '2026-06-11',
    reportedBy: '王五',
  },
  {
    id: 'maint-3',
    boxId: 'box-6',
    issueType: 'insulation',
    description: '保温效果明显下降，热食1小时就凉了',
    status: 'pending',
    resolution: '',
    reportedDate: '2026-06-18',
    resolvedDate: '',
    reportedBy: '张三',
  },
  {
    id: 'maint-4',
    boxId: 'box-1',
    issueType: 'leakage',
    description: '底部有轻微渗漏痕迹，需要检查防水层',
    status: 'repaired',
    resolution: '已更换底部防水垫',
    reportedDate: '2026-05-20',
    resolvedDate: '2026-05-21',
    reportedBy: '张三',
  },
  {
    id: 'maint-5',
    boxId: 'box-8',
    issueType: 'damage',
    description: '箱体严重破损，无法正常使用',
    status: 'scrapped',
    resolution: '已批准报废，待领取新箱',
    reportedDate: '2026-05-15',
    resolvedDate: '2026-05-16',
    reportedBy: '王五',
  },
];

function generateUsageLogs(): UsageLog[] {
  const logs: UsageLog[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    mockBoxes.forEach((box, boxIndex) => {
      if (box.status === 'scrapped') return;

      const orderCount = Math.floor(Math.random() * 8) + 3;
      for (let i = 0; i < orderCount; i++) {
        const orderTypes: Array<'hot_food' | 'cold_drink' | 'other'> = ['hot_food', 'cold_drink', 'other'];
        const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];

        logs.push({
          id: generateId(),
          boxId: box.id,
          riderId: box.riderId,
          orderId: `ORD-${dateStr.replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
          usageDate: dateStr,
          orderType,
        });
      }
    });
  }

  return logs;
}

function generateOrders(): Order[] {
  const orders: Order[] = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    const orderCount = Math.floor(Math.random() * 15) + 20;
    for (let i = 0; i < orderCount; i++) {
      const orderTypes: Array<'hot_food' | 'cold_drink' | 'other'> = ['hot_food', 'cold_drink', 'other'];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];

      orders.push({
        id: generateId(),
        orderNumber: `ORD-${dateStr.replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
        orderType,
        orderDate: dateStr,
        status: Math.random() > 0.1 ? 'completed' : 'cancelled',
      });
    }
  }

  return orders;
}

export function initializeMockData(): void {
  const isInitialized = getFromStorage<boolean>(STORAGE_KEYS.INITIALIZED, false);

  if (!isInitialized) {
    setToStorage(STORAGE_KEYS.RIDERS, mockRiders);
    setToStorage(STORAGE_KEYS.BOXES, mockBoxes);
    setToStorage(STORAGE_KEYS.CLEANING_RECORDS, generateCleaningRecords());
    setToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, mockMaintenanceRecords);
    setToStorage(STORAGE_KEYS.USAGE_LOGS, generateUsageLogs());
    setToStorage(STORAGE_KEYS.ORDERS, generateOrders());
    setToStorage(STORAGE_KEYS.INITIALIZED, true);
  }
}
