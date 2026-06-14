import { api, type PaginatedResponse } from './api';
import type { Costume, StatisticsOverview, UsageStat, ClubRanking, MissingRateStat } from '../../shared/types';

export interface CostumeQuery {
  status?: string;
  wash_status?: string;
  size?: string;
  program?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CostumeAccessoryInput {
  name: string;
  quantity: number;
  category: string;
}

export const costumeApi = {
  getList: (query?: CostumeQuery) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return api.get<PaginatedResponse<Costume>>(`/costumes${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => api.get<Costume>(`/costumes/${id}`),

  create: (data: Partial<Omit<Costume, 'accessories'>> & { accessories?: CostumeAccessoryInput[] }) =>
    api.post<Costume>('/costumes', data),

  update: (id: string, data: Partial<Omit<Costume, 'accessories'>> & { accessories?: CostumeAccessoryInput[] }) =>
    api.put<Costume>(`/costumes/${id}`, data),

  remove: (id: string) => api.delete<{ success: boolean }>(`/costumes/${id}`),

  markWashed: (id: string) => api.put<Costume>(`/costumes/${id}/wash`, {}),

  getWashList: () => api.get<Costume[]>('/costumes/wash-list'),
};

export const statisticsApi = {
  getOverview: () => api.get<StatisticsOverview>('/statistics/overview'),
  getUsageStats: (limit?: number) =>
    api.get<UsageStat[]>(`/statistics/usage${limit ? `?limit=${limit}` : ''}`),
  getClubRankings: () => api.get<ClubRanking[]>('/statistics/clubs'),
  getMissingRate: () => api.get<MissingRateStat>('/statistics/missing-rate'),
  getWashList: () => api.get<Costume[]>('/statistics/wash-list'),
  getRecentActivity: (limit?: number) =>
    api.get<any[]>(`/statistics/recent${limit ? `?limit=${limit}` : ''}`),
};
