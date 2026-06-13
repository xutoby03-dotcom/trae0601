export interface Printer {
  id: string;
  location: string;
  printerModel: string;
  paperSpec: string;
  minStock: number;
  currentStock: number;
  manager: string;
  managerPhone: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consumption {
  id: string;
  printerId: string;
  printerLocation?: string;
  department: string;
  quantity: number;
  purpose: string;
  receiver: string;
  isAbnormal: boolean;
  createdAt: string;
}

export interface Replenishment {
  id: string;
  printerId: string;
  printerLocation?: string;
  supplier: string;
  boxCount: number;
  unitPrice: number;
  totalAmount: number;
  photoUrl: string;
  createdAt: string;
}

export type AlertType = 'low_stock' | 'abnormal_consumption';
export type AlertLevel = 'warning' | 'danger';

export interface Alert {
  id: string;
  printerId: string;
  printerLocation?: string;
  type: AlertType;
  level: AlertLevel;
  message: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface ConsumptionRate {
  printerId: string;
  printerLocation: string;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

export interface DepartmentUsage {
  department: string;
  totalQuantity: number;
  percentage: number;
}

export interface ReplenishmentForecast {
  printerId: string;
  printerLocation: string;
  currentStock: number;
  minStock: number;
  dailyConsumption: number;
  estimatedDaysLeft: number;
  nextReplenishmentDate: string;
  suggestedQuantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CreatePrinterRequest {
  location: string;
  printerModel: string;
  paperSpec: string;
  minStock: number;
  currentStock: number;
  manager: string;
  managerPhone: string;
  photoUrl: string;
}

export interface CreateConsumptionRequest {
  printerId: string;
  department: string;
  quantity: number;
  purpose: string;
  receiver: string;
}

export interface CreateReplenishmentRequest {
  printerId: string;
  supplier: string;
  boxCount: number;
  unitPrice: number;
  photoUrl: string;
}
