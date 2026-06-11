import type { Seat, Dispute, StatsData, SeatRegistrationForm, DisputeForm, SeatStatus } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `请求失败: ${res.status}`);
  }
  return data as T;
}

export const apiClient = {
  listSeats(building?: string, room?: string) {
    const params = new URLSearchParams();
    if (building) params.set('building', building);
    if (room) params.set('room', room);
    const qs = params.toString();
    return request<Seat[]>(`/seats${qs ? '?' + qs : ''}`);
  },

  getSeat(id: string) {
    return request<Seat>(`/seats/${id}`);
  },

  registerSeat(form: SeatRegistrationForm) {
    return request<Seat>('/seats', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },

  updateSeat(id: string, data: { action?: 'temp_leave' | 'return' | 'release'; status?: SeatStatus; tempLeaveMinutes?: number }) {
    return request<Seat>(`/seats/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSeat(id: string) {
    return request<Seat>(`/seats/${id}`, { method: 'DELETE' });
  },

  listDisputes(status?: 'pending' | 'resolved' | 'rejected') {
    const qs = status ? `?status=${status}` : '';
    return request<Array<Dispute & { seat?: Seat }>>(`/disputes${qs}`);
  },

  createDispute(form: DisputeForm) {
    return request<Dispute>('/disputes', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },

  resolveDispute(id: string, action: 'recover' | 'reject', note?: string) {
    return request<Dispute & { seat?: Seat }>(`/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note }),
    });
  },

  getStats() {
    return request<StatsData>('/stats');
  },

  adminLogin(password: string) {
    return request<{ success: boolean; token?: string; error?: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
