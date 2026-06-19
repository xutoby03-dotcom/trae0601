import type { ApiResponse } from '@shared/types';

const BASE_URL = '/api';

async function request<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  const result: ApiResponse<T> = await res.json();
  if (!result.success) {
    throw new Error(result.message || '请求失败');
  }
  return result.data;
}

export const api = {
  getDashboardStats: () => request('/dashboard/stats'),
  getStatusDistribution: () => request('/dashboard/status-distribution'),
  getClinicUsage: () => request('/dashboard/clinic-usage'),
  getOverdueAlerts: () => request('/dashboard/overdue-alerts'),
  getLowStock: () => request('/dashboard/low-stock'),

  getDevices: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/devices${qs}`);
  },
  getDevice: (id: string) => request(`/devices/${id}`),
  createDevice: (data: any) => request('/devices', { method: 'POST', body: JSON.stringify(data) }),
  updateDevice: (id: string, data: any) => request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDeviceStatus: (id: string, status: string) => request(`/devices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteDevice: (id: string) => request(`/devices/${id}`, { method: 'DELETE' }),

  getUsages: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/usages${qs}`);
  },
  getUsage: (id: string) => request(`/usages/${id}`),
  createUsage: (data: any) => request('/usages', { method: 'POST', body: JSON.stringify(data) }),
  endUsage: (id: string, actualEndTime?: string) => request(`/usages/${id}/end`, { method: 'PATCH', body: JSON.stringify({ actualEndTime: actualEndTime || new Date().toISOString() }) }),

  getDisinfectionQueue: () => request('/disinfection/queue'),
  getDisinfectionRecords: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/disinfection/records${qs}`);
  },
  getDisinfection: (id: string) => request(`/disinfection/${id}`),
  startDisinfection: (usageId: string) => request('/disinfection/start', { method: 'POST', body: JSON.stringify({ usageId }) }),
  updateDisinfectionStep: (id: string, step: number, staff: string, note?: string) => request(`/disinfection/${id}/step`, { method: 'PATCH', body: JSON.stringify({ step, staff, note }) }),
  completeDisinfection: (id: string) => request(`/disinfection/${id}/complete`, { method: 'POST' }),

  getInventory: () => request('/inventory'),
  stockIn: (id: string, data: { quantity: number; operator: string; batch?: string }) => request(`/inventory/${id}/stock-in`, { method: 'POST', body: JSON.stringify(data) }),
  stockOut: (id: string, data: { quantity: number; operator: string; usageId?: string }) => request(`/inventory/${id}/stock-out`, { method: 'POST', body: JSON.stringify(data) }),
  getScrapRecords: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/inventory/scrap${qs}`);
  },
  createScrap: (data: any) => request('/inventory/scrap', { method: 'POST', body: JSON.stringify(data) }),
  getStockLogs: () => request('/inventory/stock-logs'),
};
