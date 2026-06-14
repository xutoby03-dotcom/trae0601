export type ExpenseType = 'fuel' | 'toll' | 'parking' | 'carwash' | 'supplies';

export type DriverSubsidyType = 'fixed' | 'percentage';

export interface Passenger {
  id: string;
  name: string;
  avatar?: string;
  isChild: boolean;
  isHalfWay: boolean;
  shareRatio: number;
}

export interface Expense {
  id: string;
  tripId: string;
  type: ExpenseType;
  amount: number;
  payerId: string;
  isSplit: boolean;
  receiptUrl?: string;
  note?: string;
  createdAt: string;
}

export interface TripSettings {
  tripId: string;
  hasDriverSubsidy: boolean;
  driverSubsidyAmount: number;
  driverSubsidyType: DriverSubsidyType;
  childFree: boolean;
  halfWayRatio: number;
}

export interface Trip {
  id: string;
  destination: string;
  departureTime: string;
  driverName: string;
  vehicleInfo: string;
  kilometers: number;
  photoUrl?: string;
  passengers: Passenger[];
  expenses: Expense[];
  settings: TripSettings;
  createdAt: string;
}

export interface SettlementItem {
  passengerId: string;
  passengerName: string;
  shouldPay: number;
  alreadyPaid: number;
  balance: number;
}

export interface SettlementSummary {
  totalCost: number;
  averageCost: number;
  maxPayer: { name: string; amount: number };
  items: SettlementItem[];
  expenseByType: { type: ExpenseType; total: number }[];
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  fuel: '油费',
  toll: '过路费',
  parking: '停车费',
  carwash: '洗车',
  supplies: '临时用品',
};

export const EXPENSE_TYPE_ICONS: Record<ExpenseType, string> = {
  fuel: 'fuel',
  toll: 'ticket',
  parking: 'parking-circle',
  carwash: 'droplets',
  supplies: 'shopping-bag',
};
