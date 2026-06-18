import type {
  Mold,
  Master,
  BorrowRecord,
  BorrowRecordWithDetails,
  ReturnCheck,
  ReturnCheckItem,
  ExceptionRecord,
  ExceptionRecordWithDetails,
  ExceptionStatus,
  DashboardStats,
  UsageBySize,
  PurchaseSuggestion,
  BorrowConflict,
} from '../../shared/types.js';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(typeof error === 'string' ? error : error.error || '请求失败');
  }

  return response.json();
}

export const api = {
  molds: {
    list: (params?: { type?: string; size?: string; material?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append('type', params.type);
      if (params?.size) searchParams.append('size', params.size);
      if (params?.material) searchParams.append('material', params.material);
      if (params?.status) searchParams.append('status', params.status);
      const query = searchParams.toString();
      return request<Mold[]>(`/molds${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Mold>(`/molds/${id}`),
    create: (data: Partial<Mold>) => request<Mold>('/molds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Mold>) => request<Mold>(`/molds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/molds/${id}`, {
      method: 'DELETE',
    }),
  },

  masters: {
    list: (params?: { status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      const query = searchParams.toString();
      return request<Master[]>(`/masters${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<Master>(`/masters/${id}`),
    create: (data: Partial<Master>) => request<Master>('/masters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Master>) => request<Master>(`/masters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<{ success: boolean }>(`/masters/${id}`, {
      method: 'DELETE',
    }),
  },

  borrows: {
    list: (params?: { masterId?: string; status?: string; moldId?: string; includeDetails?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.masterId) searchParams.append('masterId', params.masterId);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.moldId) searchParams.append('moldId', params.moldId);
      if (params?.includeDetails) searchParams.append('includeDetails', 'true');
      const query = searchParams.toString();
      return request<BorrowRecordWithDetails[]>(`/borrows${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<BorrowRecordWithDetails>(`/borrows/${id}`),
    create: (data: Partial<BorrowRecord>) => request<BorrowRecordWithDetails>('/borrows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<BorrowRecord>) => request<BorrowRecordWithDetails>(`/borrows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  returns: {
    list: () => request<ReturnCheck[]>('/returns'),
    create: (data: {
      borrowId: string;
      returnDate: string;
      checks: Record<ReturnCheckItem, boolean>;
      hasDamage: boolean;
      damageDescription?: string;
      remark?: string;
    }) => request<{ success: boolean; hasDamage: boolean; exceptionId?: string }>(`/returns`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    get: (borrowId: string) => request<ReturnCheck>(`/returns/${borrowId}`),
    pending: () => request<BorrowRecordWithDetails[]>('/returns/pending'),
  },

  exceptions: {
    list: (params?: { status?: string; moldId?: string; includeDetails?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.moldId) searchParams.append('moldId', params.moldId);
      if (params?.includeDetails) searchParams.append('includeDetails', 'true');
      const query = searchParams.toString();
      return request<ExceptionRecordWithDetails[]>(`/exceptions${query ? `?${query}` : ''}`);
    },
    get: (id: string) => request<ExceptionRecordWithDetails>(`/exceptions/${id}`),
    create: (data: Partial<ExceptionRecord>) => request<ExceptionRecordWithDetails>('/exceptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: {
      status: ExceptionStatus;
      handleNote?: string;
      resolvedDate?: string;
    }) => request<ExceptionRecordWithDetails>(`/exceptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  dashboard: {
    stats: () => request<DashboardStats>('/dashboard/stats'),
    conflicts: () => request<BorrowConflict[]>('/dashboard/conflicts'),
    overdue: () => request<BorrowRecordWithDetails[]>('/dashboard/overdue'),
    usageBySize: () => request<UsageBySize[]>('/dashboard/usage-by-size'),
    purchaseSuggestions: () => request<PurchaseSuggestion[]>('/dashboard/purchase-suggestions'),
  },
};
