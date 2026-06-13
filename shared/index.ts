export type GearType = 'umbrella' | 'raincoat' | 'shoecover' | 'other';
export type GearStatus = 'in_cabinet' | 'lent' | 'drying' | 'damaged';

export interface RainGear {
  id: string;
  name: string;
  type: GearType;
  color: string;
  location: string;
  suitableFor: string;
  isDamaged: boolean;
  photoUrl: string;
  status: GearStatus;
  borrowCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRecord {
  id: string;
  gearId: string;
  borrower: string;
  destination: string;
  lendTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  isDry: boolean;
  hasNewDamage: boolean;
  returnNote?: string;
  status: 'active' | 'returned';
}

export interface CreateGearDto {
  name: string;
  type: GearType;
  color: string;
  location: string;
  suitableFor: string;
  isDamaged: boolean;
  photoUrl: string;
}

export interface UpdateGearDto extends Partial<CreateGearDto> {
  status?: GearStatus;
}

export interface LendDto {
  borrower: string;
  destination: string;
  expectedReturnTime: string;
}

export interface ReturnDto {
  isDry: boolean;
  hasNewDamage: boolean;
  returnNote?: string;
}

export interface StatisticsSummary {
  totalCount: number;
  inCabinetCount: number;
  lentCount: number;
  dryingCount: number;
  damagedCount: number;
  overdueCount: number;
  mostBorrowed: { gear: RainGear; count: number }[];
  spareGap: { needed: number; available: number };
}

export interface OverdueItem {
  record: BorrowRecord;
  gear: RainGear;
  overdueHours: number;
}
