export type CostumeType = '学士服' | '硕士服' | '博士服' | '领结' | '披肩';
export type CostumeSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '均码';
export type CostumeStatus = '在库' | '已预约' | '借出中' | '待清洗' | '清洗中' | '已报废';
export type CleaningStatus = '干净' | '待清洗' | '清洗中' | '已清洗';
export type ReservationStatus = '待审核' | '已通过' | '已驳回' | '已取消' | '已完成';
export type TimeSlot = '08:00-10:00' | '10:00-12:00' | '14:00-16:00' | '16:00-18:00';

export interface Accessory {
  hat: boolean;
  tassel: boolean;
  bowtie: boolean;
  shawl: boolean;
}

export interface Costume {
  id: string;
  type: CostumeType;
  size: CostumeSize;
  color: string;
  accessories: Accessory;
  status: CostumeStatus;
  cleaningStatus: CleaningStatus;
  photoUrl: string;
  rfidTag?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  className: string;
  classContact: string;
  contactPhone: string;
  shootDate: string;
  timeSlot: TimeSlot;
  headCount: number;
  sizeBreakdown: Record<CostumeSize, number>;
  teacherInCharge: string;
  pickupLocation: string;
  status: ReservationStatus;
  rejectReason?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LendingItem {
  id: string;
  costumeId: string;
  costume?: Costume;
  returned: boolean;
  returnDate?: string;
  accessoryCheck?: Accessory;
  hasStain?: boolean;
  damageNote?: string;
}

export interface LendingRecord {
  id: string;
  reservationId: string;
  reservation?: Reservation;
  items: LendingItem[];
  lenderName: string;
  lendDate: string;
  expectedReturnDate: string;
  isOverdue?: boolean;
  createdAt: string;
}

export interface DamageRecord {
  id: string;
  lendingRecordId: string;
  costumeId: string;
  costume?: Costume;
  missingAccessories: Partial<Accessory>;
  hasStain: boolean;
  damageDescription: string;
  recordedAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface CleaningRecord {
  id: string;
  costumeId: string;
  costume?: Costume;
  status: '排队中' | '清洗中' | '已完成';
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  operator?: string;
}

export interface Statistics {
  sizeDemand: Record<CostumeSize, number>;
  overdueCount: number;
  missingAccessoryCount: number;
  cleaningQueueCount: number;
  statusDistribution: Record<CostumeStatus, number>;
  todayReservations: number;
  lendingCount: number;
}

export const COSTUME_SIZES: CostumeSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '均码'];
export const TIME_SLOTS: TimeSlot[] = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'];

export const ACCESSORY_LABELS: Record<keyof Accessory, string> = {
  hat: '帽子',
  tassel: '流苏',
  bowtie: '领结',
  shawl: '披肩'
};

export const STATUS_COLORS: Record<string, string> = {
  '在库': 'bg-green-100 text-green-800',
  '已预约': 'bg-blue-100 text-blue-800',
  '借出中': 'bg-yellow-100 text-yellow-800',
  '待清洗': 'bg-orange-100 text-orange-800',
  '清洗中': 'bg-purple-100 text-purple-800',
  '已报废': 'bg-gray-100 text-gray-800',
  '干净': 'bg-green-100 text-green-800',
  '已清洗': 'bg-green-100 text-green-800',
  '待审核': 'bg-yellow-100 text-yellow-800',
  '已通过': 'bg-green-100 text-green-800',
  '已驳回': 'bg-red-100 text-red-800',
  '已取消': 'bg-gray-100 text-gray-800',
  '已完成': 'bg-blue-100 text-blue-800',
  '排队中': 'bg-orange-100 text-orange-800',
  '已完成清洗': 'bg-green-100 text-green-800'
};
