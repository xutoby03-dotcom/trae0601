import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OperationRecord, OperationType } from '@/types';
import { mockRecords } from '@/utils/mock';
import { generateId } from '@/utils/date';

interface RecordStore {
  records: OperationRecord[];
  addRecord: (data: Omit<OperationRecord, 'id' | 'createdAt'>) => void;
  getRecordsByReservationId: (reservationId: string) => OperationRecord[];
  getRecordsByType: (type: OperationType) => OperationRecord[];
}

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      records: mockRecords,
      
      addRecord: (data) => {
        const newRecord: OperationRecord = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },
      
      getRecordsByReservationId: (reservationId) => {
        return get().records.filter(r => r.reservationId === reservationId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getRecordsByType: (type) => {
        return get().records.filter(r => r.type === type)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    }),
    {
      name: 'record-storage',
    }
  )
);
