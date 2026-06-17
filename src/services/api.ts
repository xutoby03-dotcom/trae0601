import { message } from 'antd';
import type { Chair, RepairOrder, RepairRecord } from '@/types';

const BASE_URL = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

async function request<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const fullUrl = BASE_URL + url;
  try {
    const res = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!res.ok || json.success) {
      return json.data as T;
    }
    throw new Error(json.message || `请求失败: ${res.status}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Failed to fetch')) {
      message.error('后端服务未启动，请先启动后端服务');
    } else {
      message.error(msg);
    }
    throw e;
  }
}

export const api = {
  chairs: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      request<Chair[]>(`/chairs?${new URLSearchParams(params as Record<string, string>).toString()}`),
    get: (id: string) => request<Chair>(`/chairs/${id}`),
    create: (data: Omit<Chair, 'id'>) =>
      request<Chair>('/chairs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Chair>) =>
      request<Chair>(`/chairs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    setDisabled: (id: string, disabled: boolean) =>
      request<Chair>(`/chairs/${id}/disable`, {
        method: 'PATCH',
        body: JSON.stringify({ disabled }),
      }),
    remove: (id: string) => request<Chair>(`/chairs/${id}`, { method: 'DELETE' }),
  },

  orders: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      request<RepairOrder[]>(`/orders?${new URLSearchParams(params as Record<string, string>).toString()}`),
    get: (id: string) => request<RepairOrder>(`/orders/${id}`),
    create: (data: Omit<RepairOrder, 'id' | 'status' | 'createdAt'>) =>
      request<RepairOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<RepairOrder>) =>
      request<RepairOrder>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    assign: (id: string, assignee: string) =>
      request<RepairOrder>(`/orders/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignee }),
      }),
    changeStatus: (id: string, status: string) =>
      request<RepairOrder>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) => request<RepairOrder>(`/orders/${id}`, { method: 'DELETE' }),
  },

  repairs: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      request<{ record: RepairRecord; order: RepairOrder }[]>(
        `/repairs?${new URLSearchParams(params as Record<string, string>).toString()}`
      ),
    get: (id: string) =>
      request<{ record: RepairRecord; order: RepairOrder }>(`/repairs/${id}`),
    create: (data: Omit<RepairRecord, 'id' | 'orderId'> & { orderId: string }) =>
      request<{ record: RepairRecord; order: RepairOrder }>('/repairs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<RepairRecord>) =>
      request<{ record: RepairRecord; order: RepairOrder }>(`/repairs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) => request<RepairRecord>(`/repairs/${id}`, { method: 'DELETE' }),
  },

  health: () => request<{ message: string; timestamp: string }>('/health'),
};

export default api;
