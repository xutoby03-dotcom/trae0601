import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Headset, BorrowRecord, ReturnTest, MeetingDemand, PurchaseNeed } from '@/types';
import { mockHeadsets, mockBorrowRecords, mockReturnTests, mockMeetingDemands, mockPurchaseNeeds } from '@/data/mockData';

interface StoreState {
  headsets: Headset[];
  borrowRecords: BorrowRecord[];
  returnTests: ReturnTest[];
  meetingDemands: MeetingDemand[];
  purchaseNeeds: PurchaseNeed[];
  
  addHeadset: (headset: Omit<Headset, 'id' | 'createdAt'>) => void;
  updateHeadset: (id: string, headset: Partial<Headset>) => void;
  deleteHeadset: (id: string) => void;
  
  addBorrowRecord: (record: Omit<BorrowRecord, 'id' | 'createdAt' | 'status'>) => void;
  
  addReturnTest: (test: Omit<ReturnTest, 'id' | 'createdAt'>) => void;
  
  addMeetingDemand: (demand: Omit<MeetingDemand, 'id' | 'createdAt'>) => void;
  
  addPurchaseNeed: (need: Omit<PurchaseNeed, 'id' | 'createdAt' | 'status'>) => void;
  updatePurchaseNeed: (id: string, updates: Partial<PurchaseNeed>) => void;
  
  resetData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      headsets: mockHeadsets,
      borrowRecords: mockBorrowRecords,
      returnTests: mockReturnTests,
      meetingDemands: mockMeetingDemands,
      purchaseNeeds: mockPurchaseNeeds,

      addHeadset: (headset) => {
        const newHeadset: Headset = {
          ...headset,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ headsets: [...get().headsets, newHeadset] });
      },

      updateHeadset: (id, updates) => {
        set({
          headsets: get().headsets.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        });
      },

      deleteHeadset: (id) => {
        set({ headsets: get().headsets.filter((h) => h.id !== id) });
      },

      addBorrowRecord: (record) => {
        const newRecord: BorrowRecord = {
          ...record,
          id: generateId(),
          status: 'borrowed',
          createdAt: new Date().toISOString(),
        };
        set({
          borrowRecords: [...get().borrowRecords, newRecord],
          headsets: get().headsets.map((h) =>
            h.id === record.headsetId ? { ...h, status: 'borrowed' } : h
          ),
        });
      },

      addReturnTest: (test) => {
        const newTest: ReturnTest = {
          ...test,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        
        const borrowRecord = get().borrowRecords.find((r) => r.id === test.borrowRecordId);
        if (!borrowRecord) return;

        const hasIssues = !test.soundTest || !test.noiseCancellation || 
                         !test.bluetoothTest || !test.wireControl || !test.appearance;

        set({
          returnTests: [...get().returnTests, newTest],
          borrowRecords: get().borrowRecords.map((r) =>
            r.id === test.borrowRecordId
              ? { ...r, status: 'returned', actualReturn: new Date().toISOString() }
              : r
          ),
          headsets: get().headsets.map((h) =>
            h.id === borrowRecord.headsetId
              ? {
                  ...h,
                  status: hasIssues ? 'faulty' : 'available',
                  microphoneIssue: !test.soundTest ? true : h.microphoneIssue,
                }
              : h
          ),
        });

        if (hasIssues) {
          const headset = get().headsets.find((h) => h.id === borrowRecord.headsetId);
          if (headset) {
            const existingNeed = get().purchaseNeeds.find(
              (p) => p.brand === headset.brand && p.model === headset.model && p.status === 'pending'
            );
            if (!existingNeed) {
              get().addPurchaseNeed({
                brand: headset.brand,
                model: headset.model,
                quantity: 1,
                reason: '归还检测发现故障，需要替换',
              });
            }
          }
        }
      },

      addMeetingDemand: (demand) => {
        const newDemand: MeetingDemand = {
          ...demand,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ meetingDemands: [...get().meetingDemands, newDemand] });
      },

      addPurchaseNeed: (need) => {
        const newNeed: PurchaseNeed = {
          ...need,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set({ purchaseNeeds: [...get().purchaseNeeds, newNeed] });
      },

      updatePurchaseNeed: (id, updates) => {
        set({
          purchaseNeeds: get().purchaseNeeds.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      resetData: () => {
        set({
          headsets: mockHeadsets,
          borrowRecords: mockBorrowRecords,
          returnTests: mockReturnTests,
          meetingDemands: mockMeetingDemands,
          purchaseNeeds: mockPurchaseNeeds,
        });
      },
    }),
    {
      name: 'headset-booking-storage',
    }
  )
);
