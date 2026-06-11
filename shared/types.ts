export interface TableData {
  id: number;
  tableNumber: string;
  capacity: number;
  isWindow: boolean;
  isMahjong: boolean;
  openTime: string;
  closeTime: string;
  photo?: string;
  createdAt: string;
}

export interface ReservationData {
  id: number;
  tableId: number;
  tableNumber?: string;
  gameType: string;
  peopleCount: number;
  startTime: string;
  endTime: string;
  contactName: string;
  contactPhone: string;
  teaRequirement: string;
  status: 'pending' | 'checked_in' | 'completed' | 'no_show' | 'cancelled';
  checkedInAt?: string;
  createdAt: string;
}

export interface StatsData {
  todayReservations: number;
  checkInRate: number;
  noShowCount: number;
  peakHours: { hour: number; count: number }[];
  popularTables: { tableId: number; tableNumber: string; count: number }[];
  noShowRecords: { name: string; phone: string; count: number }[];
}

export interface CreateReservationRequest {
  tableId: number;
  gameType: string;
  peopleCount: number;
  startTime: string;
  endTime: string;
  contactName: string;
  contactPhone: string;
  teaRequirement: string;
}

export interface CreateTableRequest {
  tableNumber: string;
  capacity: number;
  isWindow: boolean;
  isMahjong: boolean;
  openTime: string;
  closeTime: string;
  photo?: string;
}
