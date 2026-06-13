import axios from 'axios';
import type {
  RainGear,
  CreateGearDto,
  UpdateGearDto,
  LendDto,
  ReturnDto,
  BorrowRecord,
  StatisticsSummary,
  OverdueItem,
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const gearApi = {
  getAll: async (): Promise<RainGear[]> => {
    const res = await api.get('/gears');
    return res.data;
  },

  getById: async (id: string): Promise<RainGear> => {
    const res = await api.get(`/gears/${id}`);
    return res.data;
  },

  create: async (dto: CreateGearDto): Promise<RainGear> => {
    const res = await api.post('/gears', dto);
    return res.data;
  },

  update: async (id: string, dto: UpdateGearDto): Promise<RainGear> => {
    const res = await api.put(`/gears/${id}`, dto);
    return res.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/gears/${id}`);
    return res.data;
  },

  lend: async (id: string, dto: LendDto): Promise<BorrowRecord> => {
    const res = await api.post(`/gears/${id}/lend`, dto);
    return res.data;
  },

  return: async (id: string, dto: ReturnDto): Promise<BorrowRecord> => {
    const res = await api.post(`/gears/${id}/return`, dto);
    return res.data;
  },

  getRecords: async (): Promise<BorrowRecord[]> => {
    const res = await api.get('/records');
    return res.data;
  },

  getSummary: async (): Promise<StatisticsSummary> => {
    const res = await api.get('/statistics/summary');
    return res.data;
  },

  getOverdue: async (): Promise<OverdueItem[]> => {
    const res = await api.get('/statistics/overdue');
    return res.data;
  },
};
