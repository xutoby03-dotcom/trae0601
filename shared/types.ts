export interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  expectedPeople: number;
  weather: string;
  screenPosition: string;
  photo?: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  createdAt: string;
}

export type InventoryType = 'folding' | 'child' | 'wheelchair' | 'picnic';

export interface InventoryItem {
  type: InventoryType;
  name: string;
  total: number;
  used: number;
  storage: string;
  warningThreshold: number;
}

export type AreaType = 'A' | 'B' | 'C' | 'wheelchair';
export type RegistrationStatus = 'registered' | 'checked_in' | 'released';

export interface Registration {
  id: string;
  sessionId: string;
  name: string;
  phone: string;
  peopleCount: number;
  elderlyCount: number;
  childCount: number;
  needWheelchair: boolean;
  area: AreaType;
  status: RegistrationStatus;
  registeredAt: string;
  checkedInAt?: string;
}

export interface DashboardData {
  totalRegistered: number;
  checkedIn: number;
  notCheckedIn: number;
  elderlyDemands: number;
  childDemands: number;
  wheelchairDemands: number;
  inventoryGaps: { type: string; name: string; needed: number; available: number; gap: number }[];
  weatherBackup: string;
  weather: string;
}
