export interface Store {
  id: string;
  name: string;
  address: string;
}

export type UmbrellaStatus = 'available' | 'lent' | 'damaged' | 'scrapped';

export type UmbrellaSize = 'small' | 'medium' | 'large';

export interface Umbrella {
  id: string;
  code: string;
  color: string;
  size: UmbrellaSize;
  deposit: number;
  storeId: string;
  status: UmbrellaStatus;
  damageNote: string;
  photoUrl: string;
  createdAt: string;
}

export type DepositStatus = 'paid' | 'unpaid';

export interface LendRecord {
  id: string;
  umbrellaId: string;
  phoneLast4: string;
  lendTime: string;
  expectedStoreId: string;
  depositStatus: DepositStatus;
  dueTime: string;
  reminded?: boolean;
}

export interface ReturnRecord {
  id: string;
  lendRecordId: string;
  returnTime: string;
  frameOk: boolean;
  surfaceOk: boolean;
  coverOk: boolean;
  isWet: boolean;
  damageNote: string;
  finalStatus: UmbrellaStatus;
}

export interface StoreStats {
  storeId: string;
  storeName: string;
  available: number;
  lent: number;
  damaged: number;
  total: number;
}

export interface DailyPeakItem {
  hour: string;
  count: number;
  isRainyDay: boolean;
}

export interface DamageRateItem {
  month: string;
  rate: number;
}

export interface OverdueItem {
  lendRecordId: string;
  umbrellaId: string;
  umbrellaCode: string;
  umbrellaPhoto: string;
  phoneLast4: string;
  lendTime: string;
  dueTime: string;
  overdueDays: number;
  lentStoreName: string;
  expectedStoreName: string;
  reminded: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'lend' | 'return' | 'overdue' | 'damage';
  umbrellaCode: string;
  description: string;
  time: string;
}
