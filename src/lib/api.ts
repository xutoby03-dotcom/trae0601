import type {
  Package, Locker, StatsSummary, CompanyStats, AbnormalRecord,
  CreatePackagePayload, PickupPayload,
} from 'shared/types.js';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data as T;
}

export const api = {
  getPackages: (params?: { status?: string; phone?: string; tracking?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.phone) qs.set('phone', params.phone);
    if (params?.tracking) qs.set('tracking', params.tracking);
    const query = qs.toString();
    return request<(Package & { isOverdue: boolean })[]>(`/packages${query ? `?${query}` : ''}`);
  },
  getPackage: (id: string) => request<Package & { isOverdue: boolean }>(`/packages/${id}`),
  createPackage: (data: CreatePackagePayload) =>
    request<Package>('/packages', { method: 'POST', body: JSON.stringify(data) }),
  pickupPackage: (id: string, data: PickupPayload) =>
    request<Package>(`/packages/${id}/pickup`, { method: 'PUT', body: JSON.stringify(data) }),
  markAbnormal: (id: string, data: { reason: string; pickedBy: string }) =>
    request<Package>(`/packages/${id}/abnormal`, { method: 'PUT', body: JSON.stringify(data) }),

  getLockers: () => request<Locker[]>('/lockers'),
  getAvailableLockers: () => request<Locker[]>('/lockers/available'),
  updateLocker: (id: string, status: string) =>
    request<Locker>(`/lockers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getStatsSummary: () => request<StatsSummary>('/stats/summary'),
  getCompanyStats: () => request<CompanyStats[]>('/stats/by-company'),
  getAbnormalRecords: () => request<AbnormalRecord[]>('/stats/abnormal'),
};
