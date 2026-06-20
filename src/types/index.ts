export type ItemCategory =
  | 'band-aid'
  | 'gauze'
  | 'iodine-swab'
  | 'ice-pack'
  | 'thermometer'
  | 'blood-pressure-monitor';

export type ItemStatus = 'normal' | 'expired' | 'damaged' | 'low-stock';

export type BorrowStatus = 'borrowing' | 'returned' | 'overdue';

export type CleanlinessStatus = 'clean' | 'needs-cleaning' | 'damaged' | null;

export type ReminderType = 'expiry' | 'damage' | 'low-stock' | 'overdue-return';
export type ReminderLevel = 'info' | 'warning' | 'danger';

export interface MedicineBox {
  id: string;
  location: string;
  manager: string;
  capacity: number;
  applicableActivities: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  boxId: string;
  name: string;
  category: ItemCategory;
  expiryDate: string;
  quantity: number;
  storageCell: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  residentName: string;
  building: string;
  purpose: string;
  itemId: string;
  itemName: string;
  category: ItemCategory;
  quantity: number;
  returnRequirement: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  cleanlinessStatus: CleanlinessStatus;
  status: BorrowStatus;
  borrowDate: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  type: ReminderType;
  relatedId: string;
  title: string;
  description: string;
  level: ReminderLevel;
  isRead: boolean;
  createdAt: string;
}

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  'band-aid': '创可贴',
  gauze: '纱布',
  'iodine-swab': '碘伏棉签',
  'ice-pack': '冰袋',
  thermometer: '体温计',
  'blood-pressure-monitor': '血压计',
};

export const CATEGORY_ICON: Record<ItemCategory, string> = {
  'band-aid': '创可贴',
  gauze: '纱布',
  'iodine-swab': '碘伏棉签',
  'ice-pack': '冰袋',
  thermometer: '体温计',
  'blood-pressure-monitor': '血压计',
};

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  normal: '正常',
  expired: '已过期',
  damaged: '已破损',
  'low-stock': '库存不足',
};

export const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  borrowing: '借用中',
  returned: '已归还',
  overdue: '已逾期',
};

export const REMINDER_TYPE_LABEL: Record<ReminderType, string> = {
  expiry: '过期提醒',
  damage: '破损提醒',
  'low-stock': '低库存提醒',
  'overdue-return': '逾期归还提醒',
};

export const LOW_STOCK_THRESHOLD = 5;
export const EXPIRY_WARNING_DAYS = 30;

export const NEEDS_CLEAN_CHECK: ItemCategory[] = ['thermometer', 'blood-pressure-monitor'];
