import type { Bed, Reservation, CheckInRecord, OverviewStats, ClassUsage, VacancyRate, ConflictCheckResult, TimeSlot, DisinfectionStatus } from '#shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let msg = '请求失败';
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch { /* empty */ }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const bedsApi = {
  list: (params?: { room?: string; disinfectionStatus?: DisinfectionStatus }) => {
    const q = new URLSearchParams();
    if (params?.room) q.set('room', params.room);
    if (params?.disinfectionStatus) q.set('disinfectionStatus', params.disinfectionStatus);
    const qs = q.toString();
    return request<Bed[]>(`/beds${qs ? `?${qs}` : ''}`);
  },
  get: (id: number) => request<Bed>(`/beds/${id}`),
  create: (data: Partial<Bed>) => request<Bed>('/beds', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Bed>) => request<Bed>(`/beds/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/beds/${id}`, { method: 'DELETE' }),
  updateDisinfection: (id: number, disinfectionStatus: DisinfectionStatus, disinfectionDate?: string) =>
    request<Bed>(`/beds/${id}/disinfection`, { method: 'PATCH', body: JSON.stringify({ disinfectionStatus, disinfectionDate }) }),
};

export const reservationsApi = {
  list: (params?: { date?: string; className?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.set('date', params.date);
    if (params?.className) q.set('className', params.className);
    const qs = q.toString();
    return request<Reservation[]>(`/reservations${qs ? `?${qs}` : ''}`);
  },
  checkConflict: (bedId: number, date: string, timeSlot: TimeSlot) =>
    request<ConflictCheckResult>('/reservations/check-conflict', {
      method: 'POST',
      body: JSON.stringify({ bedId, date, timeSlot }),
    }),
  create: (data: { bedId: number; className: string; studentName: string; date: string; timeSlot: TimeSlot; allergyNote?: string; parentConfirmed: boolean }) =>
    request<Reservation>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/reservations/${id}`, { method: 'DELETE' }),
};

export interface CheckInDetail extends CheckInRecord {
  reservation: Reservation;
}

export const checkInsApi = {
  list: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<CheckInDetail[]>(`/check-ins${qs}`);
  },
  checkIn: (reservationId: number) =>
    request<CheckInRecord>(`/check-ins/${reservationId}/check-in`, { method: 'POST' }),
  markAbsent: (reservationId: number) =>
    request<CheckInRecord>(`/check-ins/${reservationId}/absent`, { method: 'POST' }),
  swap: (reservationId: number, toBedId: number, reason?: string) =>
    request<{ success: boolean; message: string }>(`/check-ins/${reservationId}/swap`, {
      method: 'POST',
      body: JSON.stringify({ toBedId, reason }),
    }),
};

export const statisticsApi = {
  overview: () => request<OverviewStats>('/statistics/overview'),
  classUsage: (params?: { startDate?: string; endDate?: string }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    const qs = q.toString();
    return request<ClassUsage[]>(`/statistics/class-usage${qs ? `?${qs}` : ''}`);
  },
  vacancy: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return request<VacancyRate>(`/statistics/vacancy${qs}`);
  },
  disinfectionMissed: () => request<Bed[]>('/statistics/disinfection-missed'),
};
