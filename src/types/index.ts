export type CylinderStatus = 'normal' | 'low' | 'expired' | 'abnormal';

export type AbnormalType = 'empty_return' | 'exchange' | 'leak' | 'valve';

export interface Cylinder {
  id: string;
  cylinderNo: string;
  capacity: number;
  pressure: number;
  ratedPressure: number;
  location: string;
  deposit: number;
  inspectionDate: string;
  nextInspectionDate: string;
  status: CylinderStatus;
  photoUrl: string;
  createdAt: string;
}

export interface InflationRecord {
  id: string;
  cylinderId: string;
  orderId: string;
  balloonTypeId: string;
  quantity: number;
  gasUsed: number;
  operator: string;
  createdAt: string;
}

export interface AbnormalRecord {
  id: string;
  cylinderId: string;
  type: AbnormalType;
  description: string;
  photoUrl?: string;
  reporter: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  totalAmount: number;
  profit: number;
  createdAt: string;
}

export interface BalloonType {
  id: string;
  name: string;
  size: string;
  gasPerUnit: number;
  unitPrice: number;
  color: string;
}

export interface WeeklyGasData {
  week: string;
  gasUsed: number;
}

export interface AbnormalRankItem {
  cylinderNo: string;
  count: number;
}

export interface BalloonGasRankItem {
  name: string;
  totalGas: number;
  percentage: number;
}
