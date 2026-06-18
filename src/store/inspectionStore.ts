import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InspectionRecord, InspectionResult } from '../types';
import { mockInspectionRecords } from '../mock/data';

interface InspectionState {
  records: InspectionRecord[];
  addRecord: (record: Omit<InspectionRecord, 'id'>) => void;
  addBatchRecords: (records: Omit<InspectionRecord, 'id'>[]) => void;
  getRecordsByRoom: (room: string) => InspectionRecord[];
  getRecordsByFurniture: (furnitureId: string) => InspectionRecord[];
  getRecordsByDate: (date: string) => InspectionRecord[];
}

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `XJ-${timestamp}-${random}`;
};

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      records: mockInspectionRecords,

      addRecord: (record) => {
        const newRecord: InspectionRecord = {
          ...record,
          id: generateId(),
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },

      addBatchRecords: (records) => {
        const newRecords = records.map((record) => ({
          ...record,
          id: generateId(),
        }));
        set((state) => ({
          records: [...newRecords, ...state.records],
        }));
      },

      getRecordsByRoom: (room) => {
        return get().records.filter((item) => item.room === room);
      },

      getRecordsByFurniture: (furnitureId) => {
        return get().records.filter((item) => item.furnitureId === furnitureId);
      },

      getRecordsByDate: (date) => {
        return get().records.filter((item) => item.inspectDate === date);
      },
    }),
    {
      name: 'inspection-storage-v2',
    }
  )
);
