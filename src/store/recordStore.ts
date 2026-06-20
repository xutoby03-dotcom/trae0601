import { create } from 'zustand';
import type { PackCheck, ShootingRecordItem, ReturnCheck, BatteryChange, CardFull } from '../types';
import { mockPackChecks, mockShootingRecords, mockReturnChecks } from '../data/mockData';
import { saveToStorage, loadFromStorage, generateId } from '../utils/storage';

interface RecordState {
  packChecks: PackCheck[];
  shootingRecords: ShootingRecordItem[];
  returnChecks: ReturnCheck[];
  isInitialized: boolean;

  init: () => void;

  createPackCheck: (check: Omit<PackCheck, 'id' | 'createdAt'>) => void;
  getPackChecksForMission: (missionId: string) => PackCheck[];

  createBatteryChange: (missionId: string, change: BatteryChange) => void;
  createCardFull: (missionId: string, cardFull: CardFull) => void;
  getShootingRecordForMission: (missionId: string) => ShootingRecordItem | undefined;

  createReturnCheck: (check: Omit<ReturnCheck, 'id' | 'createdAt'>) => void;
  getReturnChecksForMission: (missionId: string) => ReturnCheck[];

  getPendingReturnChecks: () => ReturnCheck[];
  getShootingRecordsForEquipment: (equipmentId: string) => ShootingRecordItem[];
}

export const useRecordStore = create<RecordState>((set, get) => ({
  packChecks: [],
  shootingRecords: [],
  returnChecks: [],
  isInitialized: false,

  init: () => {
    if (get().isInitialized) return;

    const savedPackChecks = loadFromStorage<PackCheck[]>('packChecks');
    const savedShootingRecords = loadFromStorage<ShootingRecordItem[]>('shootingRecords');
    const savedReturnChecks = loadFromStorage<ReturnCheck[]>('returnChecks');

    const packChecks = savedPackChecks || mockPackChecks;
    const shootingRecords = savedShootingRecords || mockShootingRecords;
    const returnChecks = savedReturnChecks || mockReturnChecks;

    set({
      packChecks,
      shootingRecords,
      returnChecks,
      isInitialized: true,
    });

    if (!savedPackChecks) saveToStorage('packChecks', packChecks);
    if (!savedShootingRecords) saveToStorage('shootingRecords', shootingRecords);
    if (!savedReturnChecks) saveToStorage('returnChecks', returnChecks);
  },

  createPackCheck: (checkData) => {
    const newCheck: PackCheck = {
      ...checkData,
      id: generateId('pc'),
      createdAt: new Date().toISOString(),
    };
    const packChecks = [...get().packChecks, newCheck];
    set({ packChecks });
    saveToStorage('packChecks', packChecks);
  },

  getPackChecksForMission: (missionId) => {
    return get().packChecks.filter(pc => pc.missionId === missionId);
  },

  createBatteryChange: (missionId, change) => {
    const records = [...get().shootingRecords];
    let record = records.find(r => r.missionId === missionId);

    if (!record) {
      record = {
        id: generateId('sr'),
        missionId,
        batteryChanges: [],
        cardFulls: [],
        createdAt: new Date().toISOString(),
      };
      records.push(record);
    }

    record.batteryChanges.push(change);
    set({ shootingRecords: records });
    saveToStorage('shootingRecords', records);
  },

  createCardFull: (missionId, cardFull) => {
    const records = [...get().shootingRecords];
    let record = records.find(r => r.missionId === missionId);

    if (!record) {
      record = {
        id: generateId('sr'),
        missionId,
        batteryChanges: [],
        cardFulls: [],
        createdAt: new Date().toISOString(),
      };
      records.push(record);
    }

    record.cardFulls.push(cardFull);
    set({ shootingRecords: records });
    saveToStorage('shootingRecords', records);
  },

  getShootingRecordForMission: (missionId) => {
    return get().shootingRecords.find(r => r.missionId === missionId);
  },

  createReturnCheck: (checkData) => {
    const newCheck: ReturnCheck = {
      ...checkData,
      id: generateId('rc'),
      createdAt: new Date().toISOString(),
    };
    const returnChecks = [...get().returnChecks, newCheck];
    set({ returnChecks });
    saveToStorage('returnChecks', returnChecks);
  },

  getReturnChecksForMission: (missionId) => {
    return get().returnChecks.filter(rc => rc.missionId === missionId);
  },

  getPendingReturnChecks: () => {
    return get().returnChecks.filter(rc =>
      rc.equipmentChecks.some(ec => !ec.returned || ec.damage || ec.missing)
    );
  },

  getShootingRecordsForEquipment: (equipmentId) => {
    const records: ShootingRecordItem[] = [];
    get().shootingRecords.forEach(sr => {
      const hasBatteryChange = sr.batteryChanges.some(bc => bc.equipmentId === equipmentId);
      const hasCardFull = sr.cardFulls.some(cf => cf.equipmentId === equipmentId);
      if (hasBatteryChange || hasCardFull) {
        records.push(sr);
      }
    });
    return records;
  },
}));
