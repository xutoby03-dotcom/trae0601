export interface Department {
  id: string;
  name: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  departmentId: string;
  phone: string;
  role: 'admin' | 'receptionist' | 'host';
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  plateNumber: string;
  departmentId: string;
  meetingRoom: string;
  expectedArrival: string;
  expectedDeparture: string;
  hostId: string;
  status: 'pending' | 'arrived' | 'left';
  createdAt: string;
}

export interface ParkingTicket {
  id: string;
  ticketNumber: string;
  visitorId: string;
  validHours: number;
  issuerId: string;
  issuedAt: string;
  isUsed: boolean;
  usedAt?: string;
  actualDuration?: number;
}

export interface RestockRecord {
  id: string;
  amount: number;
  operatorId: string;
  operatedAt: string;
  note?: string;
}

export interface TicketInventory {
  total: number;
  used: number;
  restockHistory: RestockRecord[];
}

export interface DeptUsage {
  deptId: string;
  deptName: string;
  count: number;
  color: string;
  percentage: number;
}

export interface StatsData {
  todayUsedCount: number;
  pendingCount: number;
  avgDuration: number;
  remainingInventory: number;
  deptUsage: DeptUsage[];
  overdueCount: number;
}

export interface VisitorWithRelations extends Visitor {
  department?: Department;
  host?: Employee;
  ticket?: ParkingTicket;
  issuer?: Employee;
}

export interface BookingFormData {
  name: string;
  company: string;
  plateNumber: string;
  departmentId: string;
  meetingRoom: string;
  expectedArrival: string;
  expectedDeparture: string;
  hostId: string;
  validHours: number;
}

export type BoardGroup = 'today' | 'tomorrow' | 'overdue';

export interface ValidationErrors {
  name?: string;
  company?: string;
  plateNumber?: string;
  departmentId?: string;
  meetingRoom?: string;
  expectedArrival?: string;
  expectedDeparture?: string;
  hostId?: string;
}
