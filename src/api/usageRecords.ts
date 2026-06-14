import { api } from './client';
import type { UsageRecord } from '../types';

export interface UsageListResponse {
  list: UsageRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUsageResponse {
  usage: UsageRecord;
  openRecord: {
    id: string;
    remainingWeight: number;
    isDiscarded: boolean;
  };
}

export const usageRecordsApi = {
  list: (params?: {
    ingredientId?: string;
    productBatch?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const search = new URLSearchParams();
    if (params?.ingredientId) search.set('ingredientId', params.ingredientId);
    if (params?.productBatch) search.set('productBatch', params.productBatch);
    if (params?.startDate) search.set('startDate', params.startDate);
    if (params?.endDate) search.set('endDate', params.endDate);
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    return api.get<UsageListResponse>(`/usage-records?${search.toString()}`);
  },

  create: (data: {
    openRecordId: string;
    ingredientId: string;
    amount: number;
    productBatch: string;
    resealed: boolean;
    operator: string;
    usageDate: string;
    note?: string;
  }) => api.post<CreateUsageResponse>('/usage-records', data),
};

export default usageRecordsApi;
