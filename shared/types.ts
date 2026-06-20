export interface Product {
  id: number;
  name: string;
  spec: string;
  flavor: string;
  costPrice: number;
  salePrice: number;
  expiryDate: string;
  shelfPosition: string;
  photo: string;
  stock: number;
  status: 'active' | 'offline' | 'expired' | 'damaged';
  barcode: string;
  createdAt: string;
}

export interface ProductCreate {
  name: string;
  spec: string;
  flavor: string;
  costPrice: number;
  salePrice: number;
  expiryDate: string;
  shelfPosition: string;
  photo: string;
  stock: number;
  barcode: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
  departmentId: number;
  department?: Department;
  avatar?: string;
}

export interface Transaction {
  id: number;
  productId: number;
  product?: Product;
  employeeId: number;
  employee?: Employee;
  departmentId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentType: 'monthly' | 'instant';
  paymentStatus: 'paid' | 'pending' | 'waived';
  createdAt: string;
  remark?: string;
}

export interface TransactionCreate {
  items: { productId: number; quantity: number }[];
  employeeId: number;
  departmentId: number;
  paymentType: 'monthly' | 'instant';
  remark?: string;
}

export interface Bill {
  id: number;
  employeeId: number;
  employee?: Employee;
  month: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  status: 'paid' | 'pending' | 'partial' | 'waived';
  transactions?: Transaction[];
  remark?: string;
  createdAt: string;
}

export interface BillDetail extends Bill {
  transactions: Transaction[];
}

export interface HotProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface DeptConsumption {
  departmentId: number;
  departmentName: string;
  totalAmount: number;
  transactionCount: number;
}

export interface ProfitStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  monthlyData: { month: string; revenue: number; cost: number; profit: number }[];
}

export interface DebtRanking {
  employeeId: number;
  employeeName: string;
  departmentName: string;
  totalDebt: number;
  billCount: number;
}

export interface RestockSuggestion {
  productId: number;
  productName: string;
  currentStock: number;
  avgMonthlySales: number;
  suggestedQuantity: number;
}

export interface ProductAlerts {
  lowStock: Product[];
  expiring: Product[];
  expired: Product[];
}
