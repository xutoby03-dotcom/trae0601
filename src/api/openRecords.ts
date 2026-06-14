import { api } from './client';
import type { OpenRecord, SealingMethod, FreezerLocation, DiscardReason, UsageRecord } from '../types';

export interface OpenRecordDetail extends OpenRecord {
  usageHistory: UsageRecord[];
}

export const openRecordsApi = {
  list: (status: 'all' | 'active' | 'discarded' = 'all', ingredientId?: string) => {
    const params = new URLSearchParams();
    params.set('status', status);
    if (ingredientId) params.set('ingredientId', ingredientId);
    return api.get<OpenRecord[]>(`/open-records?${params.toString()}`);
  },

  get: (id: string) => api.get<OpenRecordDetail>(`/open-records/${id}`),

  create: (data: {
    ingredientId: string;
    operator: string;
    openDate: string;
    remainingWeight: number;
    sealingMethod: SealingMethod;
    freezerLocation: FreezerLocation;
    actualTemp?: number;
  }) => api.post<OpenRecord>('/open-records', data),

  discard: (id: string, reason: DiscardReason, operator: string, note?: string) =>
    api.post<OpenRecord>(`/open-records/${id}/discard`, { reason, operator, note }),
};

export default openRecordsApi;
