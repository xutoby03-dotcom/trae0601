import type { ShareRecord, CreateShareRecordData, ReturnShareRecordData } from '@/types';
import { storage } from './storage';

const generateId = (): string => `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const shareService = {
  getAll: (): ShareRecord[] => {
    return storage.shareRecords.getAll()
      .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime());
  },

  getByUmbrellaId: (umbrellaId: string): ShareRecord[] => {
    return storage.shareRecords.getAll().filter(r => r.umbrellaId === umbrellaId);
  },

  getActive: (): ShareRecord[] => {
    return storage.shareRecords.getAll().filter(r => r.status === 'borrowed');
  },

  getReturned: (): ShareRecord[] => {
    return storage.shareRecords.getAll().filter(r => r.status === 'returned');
  },

  getActiveRecord: (umbrellaId: string): ShareRecord | null => {
    return storage.shareRecords.getAll()
      .find(r => r.umbrellaId === umbrellaId && r.status === 'borrowed') || null;
  },

  borrow: (data: CreateShareRecordData): ShareRecord => {
    const newRecord: ShareRecord = {
      id: generateId(),
      umbrellaId: data.umbrellaId,
      borrowerName: data.borrowerName,
      borrowerClass: data.borrowerClass,
      borrowerPhone: data.borrowerPhone,
      borrowLocation: data.borrowLocation,
      borrowTime: new Date().toISOString(),
      returnLocation: null,
      returnTime: null,
      remark: data.remark || null,
      status: 'borrowed',
    };

    const records = storage.shareRecords.getAll();
    records.unshift(newRecord);
    storage.shareRecords.setAll(records);

    return newRecord;
  },

  returnUmbrella: (recordId: string, data: ReturnShareRecordData): ShareRecord | null => {
    const records = storage.shareRecords.getAll();
    const index = records.findIndex(r => r.id === recordId);

    if (index === -1 || records[index].status === 'returned') return null;

    records[index] = {
      ...records[index],
      returnLocation: data.returnLocation,
      returnTime: new Date().toISOString(),
      remark: data.remark || records[index].remark,
      status: 'returned',
    };

    storage.shareRecords.setAll(records);
    return records[index];
  },

  getStats: () => {
    const records = storage.shareRecords.getAll();
    return {
      totalBorrowed: records.length,
      activeBorrowed: records.filter(r => r.status === 'borrowed').length,
      totalReturned: records.filter(r => r.status === 'returned').length,
    };
  },
};
