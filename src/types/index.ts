export interface Customer {
  id: string;
  name: string;
  phone: string;
  frequentItems: string[];
  creditLimit: number;
  avatar: string;
  createdAt: string;
}

export interface CreditItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreditRecord {
  id: string;
  customerId: string;
  items: CreditItem[];
  totalAmount: number;
  paidAmount: number;
  handler: string;
  remark: string;
  dueDays: number;
  createdAt: string;
  paidAt?: string;
  isPaid: boolean;
}

export interface PaymentRecord {
  id: string;
  creditRecordId: string;
  customerId: string;
  amount: number;
  handler: string;
  remark: string;
  createdAt: string;
}

export type Page = 'dashboard' | 'customers' | 'customer-detail' | 'records' | 'summary';
