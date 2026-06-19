export interface FittingRoom {
  id: string;
  number: string;
  floor: number;
  hasMirrorLight: boolean;
  cleanStatus: 'clean' | 'dirty' | 'cleaning';
  photoUrl?: string;
  maxItems: number;
  status: 'available' | 'occupied' | 'maintenance';
  currentQueueId?: string;
  currentItemsCount?: number;
}

export interface QueueItem {
  id: string;
  queueNumber: number;
  customerName?: string;
  phoneLast4?: string;
  peopleCount: number;
  itemsCount: number;
  keySizes: string[];
  assistantId: string;
  assistantName: string;
  status: 'waiting' | 'called' | 'fitting' | 'completed' | 'timeout';
  roomId?: string;
  roomNumber?: string;
  calledAt?: number;
  enteredAt?: number;
  completedAt?: number;
  createdAt: number;
}

export interface FittingRecord {
  id: string;
  queueId: string;
  roomId: string;
  purchasedCount: number;
  exchangedCount: number;
  leftItems: string[];
  cleaned: boolean;
  createdAt: number;
  customerName?: string;
  queueNumber: number;
  roomNumber: string;
  assistantName: string;
}

export interface Assistant {
  id: string;
  name: string;
  employeeId: string;
}

export interface ConversionStats {
  period: 'today' | 'week' | 'month';
  totalQueue: number;
  totalEntered: number;
  totalPurchased: number;
  fittingRate: number;
  purchaseRate: number;
  overallRate: number;
  hourlyData: HourlyStat[];
  assistantStats: AssistantStat[];
}

export interface HourlyStat {
  hour: string;
  queueCount: number;
  enteredCount: number;
  purchasedCount: number;
}

export interface AssistantStat {
  assistantId: string;
  assistantName: string;
  queueCount: number;
  enteredCount: number;
  purchasedCount: number;
  conversionRate: number;
}

export type RoomStatus = FittingRoom['status'];
export type CleanStatus = FittingRoom['cleanStatus'];
export type QueueStatus = QueueItem['status'];
