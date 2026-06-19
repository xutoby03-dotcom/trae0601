import { create } from 'zustand';
import type { MaintenanceRecord } from '../types';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface MaintenanceState {
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  fetchMaintenanceRecords: () => void;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  getRecordsByBoxId: (boxId: string) => MaintenanceRecord[];
  getOpenRecords: () => MaintenanceRecord[];
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  maintenanceRecords: [],
  loading: false,

  fetchMaintenanceRecords: () => {
    const records = getFromStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS, []);
    set({ maintenanceRecords: records });
  },

  addMaintenanceRecord: (recordData) => {
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: generateId(),
    };
    const maintenanceRecords = [...get().maintenanceRecords, newRecord];
    set({ maintenanceRecords });
    setToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, maintenanceRecords);
  },

  updateMaintenanceRecord: (id, recordData) => {
    const maintenanceRecords = get().maintenanceRecords.map((r) =>
      r.id === id ? { ...r, ...recordData } : r
    );
    set({ maintenanceRecords });
    setToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, maintenanceRecords);
  },

  deleteMaintenanceRecord: (id) => {
    const maintenanceRecords = get().maintenanceRecords.filter((r) => r.id !== id);
    set({ maintenanceRecords });
    setToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, maintenanceRecords);
  },

  getRecordsByBoxId: (boxId) => {
    return get().maintenanceRecords
      .filter((r) => r.boxId === boxId)
      .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime());
  },

  getOpenRecords: () => {
    return get().maintenanceRecords.filter(
      (r) => r.status === 'pending' || r.status === 'in_progress'
    );
  },
}));
