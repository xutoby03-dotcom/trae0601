type CostumeType = '学士服' | '硕士服' | '博士服' | '领结' | '披肩';
type CostumeSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '均码';
type CostumeStatus = '在库' | '已预约' | '借出中' | '待清洗' | '清洗中' | '已报废';
type CleaningStatus = '干净' | '待清洗' | '清洗中' | '已清洗';
type ReservationStatus = '待审核' | '已通过' | '已驳回' | '已取消' | '已完成';
type TimeSlot = '08:00-10:00' | '10:00-12:00' | '14:00-16:00' | '16:00-18:00';

interface Accessory {
  hat: boolean;
  tassel: boolean;
  bowtie: boolean;
  shawl: boolean;
}

interface Costume {
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

interface Reservation {
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
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LendingItem {
  id: string;
  costumeId: string;
  costume?: Costume;
  returned: boolean;
  returnDate?: string;
  accessoryCheck?: Accessory;
  hasStain?: boolean;
  damageNote?: string;
}

interface LendingRecord {
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

interface DamageRecord {
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

interface CleaningRecord {
  id: string;
  costumeId: string;
  costume?: Costume;
  status: '排队中' | '清洗中' | '已完成';
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  operator?: string;
}

interface UnavailableCostume {
  id: string;
  type: string;
  size: string;
  status: string;
  cleaningStatus: string;
}

interface Statistics {
  sizeDemand: Record<CostumeSize, number>;
  overdueCount: number;
  missingAccessoryCount: number;
  cleaningQueueCount: number;
  statusDistribution: Record<CostumeStatus, number>;
  todayReservations: number;
  lendingCount: number;
}
