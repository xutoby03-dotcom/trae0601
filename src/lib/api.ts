import type { FittingRoom, QueueItem, FittingRecord, Assistant, ConversionStats } from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  rooms: {
    getAll: () => request<FittingRoom[]>('/rooms'),
    create: (data: Omit<FittingRoom, 'id'>) => request<FittingRoom>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<FittingRoom>) => request<FittingRoom>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/rooms/${id}`, { method: 'DELETE' }),
  },

  queue: {
    getAll: () => request<QueueItem[]>('/queue'),
    create: (data: Omit<QueueItem, 'id' | 'queueNumber' | 'status' | 'createdAt'>) =>
      request<QueueItem>('/queue', { method: 'POST', body: JSON.stringify(data) }),
    callNext: () => request<{ queue: QueueItem; room: FittingRoom }>('/queue/call-next', { method: 'PUT' }),
    confirmEnter: (id: string) => request<QueueItem>(`/queue/${id}/enter`, { method: 'PUT' }),
    complete: (id: string, record: Partial<FittingRecord>) =>
      request<{ queue: QueueItem; record: FittingRecord }>(`/queue/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify(record),
      }),
    markTimeout: (id: string) => request<QueueItem>(`/queue/${id}/timeout`, { method: 'PUT' }),
    checkTimeouts: () => request<{ timedOut: QueueItem[] }>('/queue/check-timeouts'),
  },

  records: {
    getAll: () => request<FittingRecord[]>('/records'),
    getLeftItems: () => request<{ roomNumber: string; items: string[]; queueNumber: number }[]>('/records/left-items'),
  },

  stats: {
    getConversion: (period: 'today' | 'week' | 'month' = 'today') =>
      request<ConversionStats>(`/stats/conversion?period=${period}`),
  },

  assistants: {
    getAll: () => request<Assistant[]>('/assistants'),
    getTimeoutThreshold: () => request<{ threshold: number }>('/assistants/timeout-threshold'),
    setTimeoutThreshold: (seconds: number) =>
      request<{ success: boolean; threshold: number }>('/assistants/timeout-threshold', {
        method: 'PUT',
        body: JSON.stringify({ seconds }),
      }),
  },
};
