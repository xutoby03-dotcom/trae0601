export type DeviceStatus = 'available' | 'loaned' | 'maintenance' | 'scrapped';

export type LoanStatus = 'pending' | 'active' | 'returned' | 'overdue';

export type RenewalStatus = 'pending' | 'approved' | 'rejected';

export type ExceptionType = 'accessory_missing' | 'damage' | 'malfunction' | 'other';

export type ExceptionSeverity = 'low' | 'medium' | 'high';

export type ExceptionStatus = 'open' | 'processing' | 'resolved';

export interface Accessory {
  id: string;
  deviceId: string;
  name: string;
  quantity: number;
  description?: string;
}

export interface Device {
  id: string;
  deviceNo: string;
  name: string;
  model: string;
  serialNo: string;
  status: DeviceStatus;
  location: string;
  image?: string;
  purchaseDate: string;
  description: string;
  accessories: Accessory[];
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
}

export interface LoanAccessory {
  id: string;
  loanId: string;
  accessoryId: string;
  name: string;
  quantity: number;
  returned: boolean;
  returnQuantity?: number;
}

export interface Renewal {
  id: string;
  loanId: string;
  extendDays: number;
  newReturnDate: string;
  reason: string;
  status: RenewalStatus;
  approverId?: string;
  approver?: Employee;
  approvalNote?: string;
  applyDate: string;
  approveDate?: string;
}

export interface Exception {
  id: string;
  loanId: string;
  type: ExceptionType;
  description: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  handlerId?: string;
  handler?: Employee;
  solution?: string;
  createDate: string;
  resolveDate?: string;
}

export interface Loan {
  id: string;
  deviceId: string;
  device?: Device;
  customerId: string;
  customer?: Customer;
  employeeId: string;
  employee?: Employee;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  deposit: number;
  status: LoanStatus;
  notes?: string;
  loanAccessories: LoanAccessory[];
  renewals: Renewal[];
  exceptions: Exception[];
}

export interface ReturnCheckStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  passed?: boolean;
  notes?: string;
}
