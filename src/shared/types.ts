export type FaultStatus = 'urgent' | 'processing' | 'waiting_parts' | 'recovered' | 'repeated';

export type FaultPhenomenon =
  | 'door_stuck'
  | 'not_moving'
  | 'strange_noise'
  | 'button_fault'
  | 'light_out'
  | 'air_condition'
  | 'display_error'
  | 'other';

export interface ElevatorId {
  building: string;
  unit: string;
  elevatorNo: string;
  floorCount?: number;
}

export interface StatusTimeline {
  status: FaultStatus;
  timestamp: number;
  operator?: string;
  remark?: string;
}

export interface FaultTicket {
  id: string;
  elevator: ElevatorId;
  phenomenon: FaultPhenomenon;
  description: string;
  hasTrapped: boolean;
  trappedCount?: number;
  photos: string[];
  occurredAt: number;
  reportedBy: string;
  reportedAt: number;
  status: FaultStatus;
  handler?: string;
  estimatedRecoverAt?: number;
  detourTip?: string;
  timeline: StatusTimeline[];
  recoveredAt?: number;
  repeatedCount?: number;
}

export interface BuildingSubscription {
  buildings: string[];
  notifyOnRecovered: boolean;
  notifyOnStatusChange: boolean;
}

export type UserRole = 'resident' | 'property';

export interface AppNotification {
  id: string;
  ticketId: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface StatisticsData {
  topFaultElevators: { elevator: ElevatorId; count: number }[];
  avgRecoveryTime: number;
  statusDuration: Partial<Record<FaultStatus, number>>;
  repeatedFaultTypes: { phenomenon: FaultPhenomenon; count: number }[];
  buildingFaultCounts: { building: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  totalTickets: number;
  recoveredCount: number;
  activeCount: number;
}
