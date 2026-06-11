export type EquipmentType = 'snowboard' | 'ski' | 'helmet' | 'goggles' | 'gloves' | 'boots' | 'jacket' | 'pants';

export type EquipmentStatus = 'available' | 'rented' | 'returned';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  size: string;
  rentalShop: string;
  deposit: number;
  dailyPrice: number;
  suitableHeight: string;
  photo: string;
  status: EquipmentStatus;
}

export interface RentalRecord {
  id: string;
  equipmentId: string;
  userName: string;
  startDate: string;
  endDate: string;
  costShare: number;
  returnPerson: string;
  status: 'active' | 'returned';
  isReturned: boolean;
  isDamaged: boolean;
  depositDeducted: boolean;
  depositDeductionAmount?: number;
  returnNote?: string;
  createdAt: string;
  returnedAt?: string;
}

export interface SwapRecord {
  id: string;
  fromEquipmentId: string;
  toEquipmentId: string;
  userName: string;
  reason: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  avatar?: string;
}

export interface PersonCost {
  personName: string;
  totalRent: number;
  totalDeposit: number;
  depositDeducted: number;
  netPayable: number;
  equipmentNames: string[];
}

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  snowboard: '雪板',
  ski: '双板',
  helmet: '头盔',
  goggles: '雪镜',
  gloves: '手套',
  boots: '雪鞋',
  jacket: '雪服',
  pants: '雪裤',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: '可认领',
  rented: '已认领',
  returned: '已归还',
};
