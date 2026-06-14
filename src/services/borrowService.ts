import { api, type PaginatedResponse } from './api';
import type { BorrowRecord, ReturnCheck } from '../../shared/types';

export interface BorrowQuery {
  status?: string;
  costume_id?: string;
  club_name?: string;
  student_name?: string;
  page?: number;
  pageSize?: number;
}

export interface BorrowDetail extends BorrowRecord {
  costume_name?: string;
  costume_size?: string;
  costume_photo?: string;
  return_check?: ReturnCheck;
}

export interface CreateBorrowData {
  costume_id: string;
  student_name: string;
  club_name: string;
  activity_name?: string;
  borrow_date: string;
  expected_return_date: string;
  deposit: number;
  notes?: string;
  club_leader_name?: string;
  club_leader_contact?: string;
}

export interface ReturnData {
  clothes_ok: boolean;
  headdress_ok: boolean;
  belt_ok: boolean;
  shoe_cover_ok: boolean;
  clean_ok: boolean;
  has_stain: boolean;
  has_damage: boolean;
  issues?: string;
}

export const borrowApi = {
  getList: (query?: BorrowQuery) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return api.get<PaginatedResponse<BorrowDetail>>(`/borrows${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: number) => api.get<BorrowDetail>(`/borrows/${id}`),

  getActiveByCostume: (costumeId: string) => api.get<BorrowDetail | null>(`/borrows/active-by-costume/${costumeId}`),

  getOverdue: () => api.get<(BorrowDetail & { overdue_days: number })[]>('/borrows/overdue'),

  create: (data: CreateBorrowData) => api.post<BorrowDetail>('/borrows', data),

  returnCostume: (id: number, data: ReturnData) =>
    api.put<BorrowDetail>(`/borrows/${id}/return`, data),

  markReminder: (id: number) =>
    api.put<BorrowDetail>(`/borrows/${id}/remind`, {}),
};
