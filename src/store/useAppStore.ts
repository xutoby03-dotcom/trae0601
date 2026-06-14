import { create } from 'zustand';
import { formatISO } from 'date-fns';
import type {
  AirConditioner,
  CleaningRecord,
  ACFormData,
  CleaningRecordFormData,
} from '@/types';
import { storage, generateId } from '@/utils/storage';
import { mockAirConditioners, mockCleaningRecords } from '@/utils/mockData';

interface AppState {
  airConditioners: AirConditioner[];
  cleaningRecords: CleaningRecord[];
  isLoading: boolean;
  error: string | null;

  initData: () => void;
  addAirConditioner: (data: ACFormData) => void;
  updateAirConditioner: (id: string, data: Partial<ACFormData>) => void;
  deleteAirConditioner: (id: string) => void;
  addCleaningRecord: (acId: string, data: CleaningRecordFormData) => void;
  updateCleaningRecord: (id: string, data: Partial<CleaningRecordFormData>) => void;
  canInstallBack: (record: CleaningRecord) => boolean;
  installBack: (recordId: string, installedAt: string) => { success: boolean; error?: string };
}

export const useAppStore = create<AppState>((set, get) => ({
  airConditioners: [],
  cleaningRecords: [],
  isLoading: true,
  error: null,

  initData: () => {
    try {
      if (!storage.isInitialized()) {
        storage.setAirConditioners(mockAirConditioners);
        storage.setCleaningRecords(mockCleaningRecords);
        storage.setInitialized(true);
      }
      set({
        airConditioners: storage.getAirConditioners(),
        cleaningRecords: storage.getCleaningRecords(),
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '初始化数据失败',
        isLoading: false,
      });
    }
  },

  addAirConditioner: (data: ACFormData) => {
    const now = formatISO(new Date());
    const newAC: AirConditioner = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().airConditioners, newAC];
    storage.setAirConditioners(updated);
    set({ airConditioners: updated });
  },

  updateAirConditioner: (id: string, data: Partial<ACFormData>) => {
    const updated = get().airConditioners.map((ac) =>
      ac.id === id
        ? { ...ac, ...data, updatedAt: formatISO(new Date()) }
        : ac
    );
    storage.setAirConditioners(updated);
    set({ airConditioners: updated });
  },

  deleteAirConditioner: (id: string) => {
    const updatedACs = get().airConditioners.filter((ac) => ac.id !== id);
    const updatedRecords = get().cleaningRecords.filter((r) => r.acId !== id);
    storage.setAirConditioners(updatedACs);
    storage.setCleaningRecords(updatedRecords);
    set({
      airConditioners: updatedACs,
      cleaningRecords: updatedRecords,
    });
  },

  addCleaningRecord: (acId: string, data: CleaningRecordFormData) => {
    const newRecord: CleaningRecord = {
      ...data,
      id: generateId(),
      acId,
      createdAt: formatISO(new Date()),
    };
    const updated = [...get().cleaningRecords, newRecord];
    storage.setCleaningRecords(updated);
    set({ cleaningRecords: updated });
  },

  updateCleaningRecord: (id: string, data: Partial<CleaningRecordFormData>) => {
    const updated = get().cleaningRecords.map((r) =>
      r.id === id ? { ...r, ...data } : r
    );
    storage.setCleaningRecords(updated);
    set({ cleaningRecords: updated });
  },

  canInstallBack: (record: CleaningRecord): boolean => {
    return record.dryingStatus === 'dried';
  },

  installBack: (recordId: string, installedAt: string) => {
    const record = get().cleaningRecords.find((r) => r.id === recordId);
    if (!record) {
      return { success: false, error: '未找到清洗记录' };
    }
    if (!get().canInstallBack(record)) {
      return { success: false, error: '滤网未晾干，不能装回！请等待滤网完全干燥后再操作。' };
    }
    const updated = get().cleaningRecords.map((r) =>
      r.id === recordId ? { ...r, installedBackAt: installedAt } : r
    );
    storage.setCleaningRecords(updated);
    set({ cleaningRecords: updated });
    return { success: true };
  },
}));
