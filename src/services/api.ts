import type {
  Product,
  ProductCreate,
  Employee,
  Department,
  Transaction,
  TransactionCreate,
  Bill,
  BillDetail,
  ProductAlerts,
  HotProduct,
  DeptConsumption,
  ProfitStats,
  DebtRanking,
  RestockSuggestion,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const productApi = {
  getAll: (status?: string) =>
    request<Product[]>(`/products${status ? `?status=${status}` : ''}`),
  getOne: (id: number) => request<Product>(`/products/${id}`),
  search: (q: string) => request<Product[]>(`/products/search?q=${encodeURIComponent(q)}`),
  create: (data: ProductCreate) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ProductCreate> & { status?: string }) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  restock: (id: number, quantity: number) =>
    request<Product>(`/products/${id}/restock`, { method: 'POST', body: JSON.stringify({ quantity }) }),
  getAlerts: () => request<ProductAlerts>('/products/alerts'),
};

export const employeeApi = {
  getAll: () => request<Employee[]>('/employees'),
  getOne: (id: number) => request<Employee>(`/employees/${id}`),
  create: (data: { name: string; departmentId: number; avatar?: string }) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name?: string; departmentId?: number; avatar?: string }) =>
    request<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean }>(`/employees/${id}`, { method: 'DELETE' }),
  getDepartments: () => request<Department[]>('/employees/departments/list'),
};

export const transactionApi = {
  getAll: (params?: { employeeId?: number; month?: string }) => {
    const search = new URLSearchParams();
    if (params?.employeeId) search.set('employeeId', String(params.employeeId));
    if (params?.month) search.set('month', params.month);
    return request<Transaction[]>(`/transactions${search.toString() ? `?${search}` : ''}`);
  },
  create: (data: TransactionCreate) =>
    request<Transaction[]>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),
};

export const billApi = {
  getAll: (params?: { month?: string; employeeId?: number }) => {
    const search = new URLSearchParams();
    if (params?.month) search.set('month', params.month);
    if (params?.employeeId) search.set('employeeId', String(params.employeeId));
    return request<Bill[]>(`/bills${search.toString() ? `?${search}` : ''}`);
  },
  getOne: (id: number) => request<BillDetail>(`/bills/${id}`),
  generate: (month: string) =>
    request<Bill[]>('/bills/generate', { method: 'POST', body: JSON.stringify({ month }) }),
  updateStatus: (id: number, status: 'paid' | 'pending' | 'waived', remark?: string) =>
    request<Bill>(`/bills/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remark }),
    }),
};

export const statsApi = {
  getHotProducts: (limit = 10, month?: string) => {
    const search = new URLSearchParams({ limit: String(limit) });
    if (month) search.set('month', month);
    return request<HotProduct[]>(`/stats/hot-products?${search}`);
  },
  getDeptConsumption: (month?: string) => {
    const search = month ? `?month=${month}` : '';
    return request<DeptConsumption[]>(`/stats/dept-consumption${search}`);
  },
  getProfit: (month?: string) => {
    const search = month ? `?month=${month}` : '';
    return request<ProfitStats>(`/stats/profit${search}`);
  },
  getDebtRanking: () => request<DebtRanking[]>('/stats/debt-ranking'),
  getRestockSuggestions: () => request<RestockSuggestion[]>('/stats/restock-suggestions'),
};
