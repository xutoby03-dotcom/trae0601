import { fetchApi } from '../store/auth';
import {
  Chair,
  Booking,
  BookingCreateRequest,
  CleanupConfirmRequest,
  DamageRecord,
  UsageStats,
  PopularTimeSlot,
  NoShowRecord,
  DamagePartStats,
} from '../../shared/types';

export const chairApi = {
  getAll: () => fetchApi<Chair[]>('/chairs'),
  getAvailable: (date: string, startTime: string, endTime: string) =>
    fetchApi<Chair[]>(`/chairs/available?date=${date}&startTime=${startTime}&endTime=${endTime}`),
  getById: (id: number) =>
    fetchApi<{ chair: Chair; damageRecords: DamageRecord[] }>(`/chairs/${id}`),
};

export const bookingApi = {
  create: (data: BookingCreateRequest) =>
    fetchApi<{ bookingId: number }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMy: () => fetchApi<Booking[]>('/bookings/my'),
  getById: (id: number) => fetchApi<Booking>(`/bookings/${id}`),
  checkin: (id: number) =>
    fetchApi(`/bookings/${id}/checkin`, { method: 'POST' }),
  endUsage: (id: number) =>
    fetchApi(`/bookings/${id}/end`, { method: 'POST' }),
  confirmCleanup: (id: number, data: CleanupConfirmRequest) =>
    fetchApi(`/bookings/${id}/cleanup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (id: number) =>
    fetchApi(`/bookings/${id}/cancel`, { method: 'POST' }),
};

export const adminApi = {
  getUsageStats: (days?: number) =>
    fetchApi<UsageStats[]>(`/admin/stats/usage${days ? `?days=${days}` : ''}`),
  getPopularTimes: () =>
    fetchApi<PopularTimeSlot[]>('/admin/stats/popular-times'),
  getNoShowList: () =>
    fetchApi<NoShowRecord[]>('/admin/stats/no-shows'),
  getDamageStats: () =>
    fetchApi<DamagePartStats[]>('/admin/stats/damages'),
  getTodaySummary: () =>
    fetchApi<any>('/admin/stats/today'),
};
