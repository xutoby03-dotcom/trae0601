import type { CollectionRecord } from '../types';

export const mockCollectionRecords: CollectionRecord[] = [
  {
    id: 'col001',
    recoveryPointId: 'rp001',
    weightKg: 95,
    collectionTime: '2026-06-17T10:00:00Z',
    collector: '张师傅',
    status: 'completed',
    createdAt: '2026-06-16T14:30:00Z',
  },
  {
    id: 'col002',
    recoveryPointId: 'rp002',
    weightKg: 88,
    collectionTime: '2026-06-16T14:00:00Z',
    collector: '李师傅',
    status: 'completed',
    createdAt: '2026-06-15T18:00:00Z',
  },
  {
    id: 'col003',
    recoveryPointId: 'rp003',
    weightKg: 76,
    collectionTime: '2026-06-15T09:00:00Z',
    collector: '张师傅',
    status: 'completed',
    createdAt: '2026-06-14T12:00:00Z',
  },
  {
    id: 'col004',
    recoveryPointId: 'rp004',
    weightKg: 102,
    collectionTime: '2026-06-14T16:00:00Z',
    collector: '王师傅',
    status: 'completed',
    createdAt: '2026-06-13T08:00:00Z',
  },
];
