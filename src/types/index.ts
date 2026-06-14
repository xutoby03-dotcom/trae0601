export type DisplayStatus = 'available' | 'borrowed' | 'maintenance' | 'missing';
export type ReservationStatus = 'reserved' | 'using' | 'returned' | 'cancelled';
export type TimeSlot = 'morning' | 'afternoon' | 'allday';
export type DisplayInterface = 'HDMI' | 'DP' | 'VGA' | 'Type-C' | 'DVI';

export interface Accessory {
  name: string;
  quantity: number;
}

export interface Display {
  id: string;
  code: string;
  size: number;
  interfaces: DisplayInterface[];
  location: string;
  accessories: Accessory[];
  status: DisplayStatus;
  photoUrl: string;
  missingAccessories: string[];
  damageCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  displayId: string;
  userName: string;
  department: string;
  useDate: string;
  timeSlot: TimeSlot;
  workstation: string;
  purpose: string;
  status: ReservationStatus;
  borrowTime?: string;
  returnTime?: string;
  hasPowerCable?: boolean;
  hasAdapter?: boolean;
  hasScratch?: boolean;
  inCorrectLocation?: boolean;
  returnNotes?: string;
  createdAt: string;
}

export const TIME_SLOT_LABEL: Record<TimeSlot, string> = {
  morning: '上午 09:00-12:30',
  afternoon: '下午 13:30-18:00',
  allday: '全天 09:00-18:00',
};

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  available: '可借用',
  borrowed: '已借出',
  maintenance: '维修中',
  missing: '配件缺失',
};

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  reserved: '已预约',
  using: '使用中',
  returned: '已归还',
  cancelled: '已取消',
};

export const DISPLAY_STATUS_COLOR: Record<DisplayStatus, string> = {
  available: 'bg-emerald-500',
  borrowed: 'bg-sky-500',
  maintenance: 'bg-amber-500',
  missing: 'bg-rose-500',
};

export const RESERVATION_STATUS_COLOR: Record<ReservationStatus, string> = {
  reserved: 'bg-sky-100 text-sky-700 border-sky-200',
  using: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export const DISPLAY_INTERFACE_COLORS: Record<DisplayInterface, string> = {
  HDMI: 'bg-sky-100 text-sky-700',
  DP: 'bg-violet-100 text-violet-700',
  VGA: 'bg-amber-100 text-amber-700',
  'Type-C': 'bg-teal-100 text-teal-700',
  DVI: 'bg-rose-100 text-rose-700',
};

export const DEPARTMENTS = [
  '研发部',
  '产品部',
  '设计部',
  '市场部',
  '销售部',
  '人力资源部',
  '财务部',
  '行政部',
  '客户服务部',
];
