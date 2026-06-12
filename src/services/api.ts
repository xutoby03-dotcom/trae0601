import type {
  Room,
  RoomForm,
  Borrow,
  BorrowForm,
  ReturnForm,
  ExceptionRecord,
  ExceptionForm,
  DashboardStats,
} from '../../shared/types.js';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const roomsApi = {
  list: () => request<Room[]>('/rooms'),
  get: (id: number) => request<Room>(`/rooms/${id}`),
  create: (data: RoomForm) =>
    request<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: RoomForm) =>
    request<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request<{ success: boolean }>(`/rooms/${id}`, { method: 'DELETE' }),
};

export const borrowsApi = {
  list: (status?: string) =>
    request<Borrow[]>(status ? `/borrows?status=${status}` : '/borrows'),
  get: (id: number) => request<Borrow>(`/borrows/${id}`),
  create: (data: BorrowForm) =>
    request<Borrow>('/borrows', { method: 'POST', body: JSON.stringify(data) }),
  returnBorrow: (id: number, data: ReturnForm) =>
    request<Borrow>(`/borrows/${id}/return`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  overdue: () => request<Borrow[]>('/borrows/overdue'),
};

export const exceptionsApi = {
  list: () => request<ExceptionRecord[]>('/exceptions'),
  get: (id: number) => request<ExceptionRecord>(`/exceptions/${id}`),
  create: (data: ExceptionForm) =>
    request<ExceptionRecord>('/exceptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ExceptionForm) =>
    request<ExceptionRecord>(`/exceptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const statsApi = {
  dashboard: () => request<DashboardStats>('/stats/dashboard'),
};
