export interface Vehicle {
  id: string;
  driverName: string;
  carModel: string;
  plateNumber: string;
  totalSeats: number;
  trunkSpace: number;
  fuelConsumption: number;
  radioChannel: string;
  photoUrl: string;
}

export interface Person {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Passenger {
  id: string;
  vehicleId: string;
  personId: string;
  isDriver: boolean;
}

export type EquipmentCategory = 'cooking' | 'sleeping' | 'safety' | 'entertainment' | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  size: number;
  vehicleId: string | null;
  isCritical: boolean;
}

export type ItineraryType = 'meetup' | 'supply' | 'fuel' | 'camp' | 'scenic';

export interface ItineraryStep {
  id: string;
  type: ItineraryType;
  name: string;
  address: string;
  arriveTime: string;
  departTime?: string;
  note?: string;
  order: number;
}

export type EventType = 'delay' | 'detour' | 'breakdown' | 'accident' | 'other';

export interface EventRecord {
  id: string;
  type: EventType;
  vehicleId: string | null;
  time: string;
  description: string;
}

export type ExpenseCategory = 'fuel' | 'toll' | 'parking' | 'food' | 'supply' | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  vehicleId: string | null;
  payerId: string;
  time: string;
  note?: string;
}

export interface Warning {
  id: string;
  type: 'overload' | 'critical_equipment' | 'trunk_full';
  level: 'error' | 'warning';
  message: string;
  vehicleId?: string;
  equipmentId?: string;
}

export interface PersonSettlement {
  personId: string;
  name: string;
  paid: number;
  shouldPay: number;
  balance: number;
}
