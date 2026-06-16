import { create } from 'zustand';
import { DailyCheckIn, CheckInSource } from '@/types';
import { mockCheckIns } from '@/data/checkIn';
import { getStorage, setStorage, generateId } from '@/utils/storage';
import { getToday, formatDateTime } from '@/utils/date';

interface CheckInState {
  checkInRecords: DailyCheckIn[];
  loading: boolean;
  initCheckIns: () => void;
  recordCheckIn: (elderlyId: string, source: CheckInSource, notes?: string) => void;
  getTodayStatus: (elderlyId: string) => DailyCheckIn | undefined;
  getTodayUnconfirmed: (allElderlyIds: string[]) => string[];
  getTodayStats: (allElderlyIds: string[]) => { total: number; confirmed: number; unconfirmed: number };
}

const STORAGE_KEY = 'checkin_records';

export const useCheckInStore = create<CheckInState>((set, get) => ({
  checkInRecords: [],
  loading: true,

  initCheckIns: () => {
    const stored = getStorage<DailyCheckIn[]>(STORAGE_KEY, []);
    const initialData = stored.length > 0 ? stored : mockCheckIns;
    set({ checkInRecords: initialData, loading: false });
    if (stored.length === 0) {
      setStorage(STORAGE_KEY, mockCheckIns);
    }
  },

  recordCheckIn: (elderlyId, source, notes = '') => {
    const today = getToday();
    const existing = get().checkInRecords.find(
      c => c.elderlyId === elderlyId && c.checkDate === today
    );
    
    let newRecords;
    if (existing) {
      newRecords = get().checkInRecords.map(c =>
        c.id === existing.id
          ? { ...c, source, status: 'confirmed', checkTime: formatDateTime(new Date()), notes }
          : c
      );
    } else {
      const newCheckIn: DailyCheckIn = {
        id: generateId(),
        elderlyId,
        checkDate: today,
        source,
        status: 'confirmed',
        checkTime: formatDateTime(new Date()),
        operatorId: 'user-1',
        notes,
      };
      newRecords = [...get().checkInRecords, newCheckIn];
    }
    
    set({ checkInRecords: newRecords });
    setStorage(STORAGE_KEY, newRecords);
  },

  getTodayStatus: (elderlyId) => {
    const today = getToday();
    return get().checkInRecords.find(
      c => c.elderlyId === elderlyId && c.checkDate === today
    );
  },

  getTodayUnconfirmed: (allElderlyIds) => {
    const today = getToday();
    const confirmedToday = get().checkInRecords
      .filter(c => c.checkDate === today && c.status === 'confirmed')
      .map(c => c.elderlyId);
    return allElderlyIds.filter(id => !confirmedToday.includes(id));
  },

  getTodayStats: (allElderlyIds) => {
    const today = getToday();
    const confirmed = get().checkInRecords.filter(
      c => c.checkDate === today && c.status === 'confirmed'
    ).length;
    return {
      total: allElderlyIds.length,
      confirmed,
      unconfirmed: allElderlyIds.length - confirmed,
    };
  },
}));
