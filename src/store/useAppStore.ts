import { create } from 'zustand';
import type { Bag, BorrowRecord, BagFormData, BorrowFormData, ReturnFormData } from '@/types';
import { loadBags, loadRecords, saveBags, saveRecords } from '@/utils/storage';
import { generateId, isOverdue, getDefaultBagPhoto } from '@/utils/helpers';
import { getMockBags, getMockRecords } from '@/utils/mockData';

interface AppState {
  bags: Bag[];
  records: BorrowRecord[];
  initialized: boolean;
  
  initData: () => void;
  addBag: (data: BagFormData) => void;
  updateBag: (id: string, data: Partial<BagFormData>) => void;
  deleteBag: (id: string) => void;
  
  addBorrow: (data: BorrowFormData) => void;
  returnBag: (recordId: string, data: ReturnFormData) => void;
  markAsLost: (recordId: string) => void;
  
  refreshOverdueStatus: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  bags: [],
  records: [],
  initialized: false,
  
  initData: () => {
    if (get().initialized) return;
    
    let bags = loadBags<Bag[]>([]);
    let records = loadRecords<BorrowRecord[]>([]);
    
    if (bags.length === 0) {
      bags = getMockBags();
      records = getMockRecords(bags);
      saveBags(bags);
      saveRecords(records);
    }
    
    records = records.map(record => {
      if (record.status === 'active' && isOverdue(record.expectedReturnTime)) {
        return { ...record, status: 'overdue' as const };
      }
      return record;
    });
    
    saveRecords(records);
    set({ bags, records, initialized: true });
  },
  
  addBag: (data: BagFormData) => {
    const newBag: Bag = {
      id: generateId(),
      ...data,
      status: 'available',
      turnoverCount: 0,
      damageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const bags = [...get().bags, newBag];
    saveBags(bags);
    set({ bags });
  },
  
  updateBag: (id: string, data: Partial<BagFormData>) => {
    const bags = get().bags.map(bag =>
      bag.id === id ? { ...bag, ...data, updatedAt: new Date().toISOString() } : bag
    );
    saveBags(bags);
    set({ bags });
  },
  
  deleteBag: (id: string) => {
    const bags = get().bags.filter(bag => bag.id !== id);
    saveBags(bags);
    set({ bags });
  },
  
  addBorrow: (data: BorrowFormData) => {
    const newRecord: BorrowRecord = {
      id: generateId(),
      ...data,
      borrowTime: new Date().toISOString(),
      status: 'active',
      depositRefunded: false,
      createdAt: new Date().toISOString(),
    };
    
    const records = [...get().records, newRecord];
    saveRecords(records);
    
    const bags = get().bags.map(bag =>
      bag.id === data.bagId
        ? { ...bag, status: 'borrowed' as const, turnoverCount: bag.turnoverCount + 1, updatedAt: new Date().toISOString() }
        : bag
    );
    saveBags(bags);
    
    set({ records, bags });
  },
  
  returnBag: (recordId: string, data: ReturnFormData) => {
    const record = get().records.find(r => r.id === recordId);
    if (!record) return;
    
    const records = get().records.map(r =>
      r.id === recordId
        ? {
            ...r,
            status: 'returned' as const,
            actualReturnTime: new Date().toISOString(),
            hasStain: data.hasStain,
            hasDamage: data.hasDamage,
            zipperOk: data.zipperOk,
            hasPad: data.hasPad,
            damageNote: data.damageNote,
            depositRefunded: data.depositRefunded,
          }
        : r
    );
    saveRecords(records);
    
    const hasDamage = data.hasDamage || !data.zipperOk || !data.hasPad;
    const bagStatus: Bag['status'] = hasDamage ? 'damaged' : 'available';
    
    const bags = get().bags.map(bag =>
      bag.id === record.bagId
        ? {
            ...bag,
            status: bagStatus,
            damageCount: hasDamage ? bag.damageCount + 1 : bag.damageCount,
            updatedAt: new Date().toISOString(),
          }
        : bag
    );
    saveBags(bags);
    
    set({ records, bags });
  },
  
  markAsLost: (recordId: string) => {
    const record = get().records.find(r => r.id === recordId);
    if (!record) return;
    
    const records = get().records.map(r =>
      r.id === recordId ? { ...r, status: 'lost' as const } : r
    );
    saveRecords(records);
    
    const bags = get().bags.map(bag =>
      bag.id === record.bagId ? { ...bag, status: 'lost' as const, updatedAt: new Date().toISOString() } : bag
    );
    saveBags(bags);
    
    set({ records, bags });
  },
  
  refreshOverdueStatus: () => {
    const currentRecords = get().records;
    let changed = false;
    
    const records = currentRecords.map(record => {
      if (record.status === 'active' && isOverdue(record.expectedReturnTime)) {
        changed = true;
        return { ...record, status: 'overdue' as const };
      }
      return record;
    });
    
    if (!changed) return;
    
    saveRecords(records);
    set({ records });
  },
}));
