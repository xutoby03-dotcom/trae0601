export interface FamilyMember {
  id: string;
  name: string;
  role: '爷爷' | '奶奶' | '爸爸' | '妈妈' | '阿姨' | '其他';
  avatar?: string;
  phone: string;
  color: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  dismissTime: string;
  teacherName: string;
  teacherPhone: string;
  grade?: string;
  className?: string;
}

export interface Child {
  id: string;
  name: string;
  schoolId: string;
  gender?: 'boy' | 'girl';
  fixedPickupId: string;
  backupContactIds: string[];
}

export type PickupStatus = 'pending' | 'picked' | 'late' | 'swapped';

export type SwapStatus = 'none' | 'requested' | 'confirmed' | 'rejected';

export interface PickupRecord {
  id: string;
  date: string;
  childId: string;
  schoolId: string;
  assignedTo: string;
  status: PickupStatus;
  swapStatus: SwapStatus;
  swapFrom?: string;
  swapTo?: string;
  swapRequestTime?: string;
  swapConfirmTime?: string;
  pickedTime?: string;
  remark?: string;
  isLate?: boolean;
  lateMinutes?: number;
}

export interface PickupStats {
  memberId: string;
  totalPickups: number;
  lateCount: number;
  onTimeRate: number;
}

export interface SwapStats {
  date: string;
  count: number;
}
