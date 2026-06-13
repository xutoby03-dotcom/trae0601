import { create } from 'zustand';
import { Device, LendingRecord, Compensation, DeviceStatus } from '../types';
import {
  getDevices,
  saveDevices,
  getLendingRecords,
  saveLendingRecords,
  getCompensations,
  saveCompensations,
  generateId,
} from '../utils/storage';
import { mockDevices, mockLendingRecords, mockCompensations } from '../utils/mock';
import { calculateCompensation, isOverdue, getTodayString } from '../utils/helpers';

interface AppState {
  devices: Device[];
  lendingRecords: LendingRecord[];
  compensations: Compensation[];
  initialized: boolean;
  initData: () => void;
  addDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  addLending: (record: Omit<LendingRecord, 'id' | 'status' | 'lendDate'>) => void;
  returnDevice: (
    recordId: string,
    returnData: {
      returnBattery: number;
      cableOk: boolean;
      shellOk: boolean;
      missingAccessories: string[];
    }
  ) => void;
  updateCompensationStatus: (id: string, status: Compensation['status']) => void;
  updateOverdueStatus: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  lendingRecords: [],
  compensations: [],
  initialized: false,

  initData: () => {
    if (get().initialized) return;

    let devices = getDevices();
    let lendingRecords = getLendingRecords();
    let compensations = getCompensations();

    if (devices.length === 0) {
      devices = mockDevices;
      saveDevices(devices);
    }

    if (lendingRecords.length === 0) {
      lendingRecords = mockLendingRecords;
      saveLendingRecords(lendingRecords);
    }

    if (compensations.length === 0) {
      compensations = mockCompensations;
      saveCompensations(compensations);
    }

    const updatedRecords = lendingRecords.map((r) => {
      if (r.status === 'active' && isOverdue(r.expectedReturnDate)) {
        return { ...r, status: 'overdue' as const };
      }
      return r;
    });

    if (JSON.stringify(updatedRecords) !== JSON.stringify(lendingRecords)) {
      saveLendingRecords(updatedRecords);
      lendingRecords = updatedRecords;
    }

    const lentDeviceIds = lendingRecords
      .filter((r) => r.status === 'active' || r.status === 'overdue')
      .map((r) => r.deviceId);

    const syncedDevices = devices.map((d) => {
      const isLent = lentDeviceIds.includes(d.id);
      if (isLent && d.status !== 'lent') {
        return { ...d, status: 'lent' as const, updatedAt: getTodayString() };
      }
      if (!isLent && d.status === 'lent') {
        const newStatus: DeviceStatus = d.currentBattery < 20 ? 'low_battery' : 'available';
        return { ...d, status: newStatus, updatedAt: getTodayString() };
      }
      return d;
    });

    if (JSON.stringify(syncedDevices) !== JSON.stringify(devices)) {
      saveDevices(syncedDevices);
      devices = syncedDevices;
    }

    set({
      devices,
      lendingRecords,
      compensations,
      initialized: true,
    });
  },

  addDevice: (deviceData) => {
    const newDevice: Device = {
      ...deviceData,
      id: generateId(),
      createdAt: getTodayString(),
      updatedAt: getTodayString(),
    };

    const newDevices = [...get().devices, newDevice];
    saveDevices(newDevices);
    set({ devices: newDevices });
  },

  updateDevice: (id, deviceData) => {
    const newDevices = get().devices.map((d) =>
      d.id === id ? { ...d, ...deviceData, updatedAt: getTodayString() } : d
    );
    saveDevices(newDevices);
    set({ devices: newDevices });
  },

  deleteDevice: (id) => {
    const newDevices = get().devices.filter((d) => d.id !== id);
    saveDevices(newDevices);
    set({ devices: newDevices });
  },

  addLending: (recordData) => {
    const newRecord: LendingRecord = {
      ...recordData,
      id: generateId(),
      lendDate: getTodayString(),
      status: 'active',
    };

    const newRecords = [...get().lendingRecords, newRecord];
    saveLendingRecords(newRecords);

    const newDevices = get().devices.map((d) =>
      d.id === recordData.deviceId ? { ...d, status: 'lent' as DeviceStatus, updatedAt: getTodayString() } : d
    );
    saveDevices(newDevices);

    set({
      lendingRecords: newRecords,
      devices: newDevices,
    });
  },

  returnDevice: (recordId, returnData) => {
    const { returnBattery, cableOk, shellOk, missingAccessories } = returnData;
    const record = get().lendingRecords.find((r) => r.id === recordId);
    if (!record) return;

    const compResult = calculateCompensation(
      missingAccessories,
      cableOk,
      shellOk,
      returnBattery
    );

    const updatedRecord: LendingRecord = {
      ...record,
      status: 'returned',
      returnDate: getTodayString(),
      returnBattery,
      cableOk,
      shellOk,
      missingAccessories,
    };

    const newRecords = get().lendingRecords.map((r) =>
      r.id === recordId ? updatedRecord : r
    );
    saveLendingRecords(newRecords);

    let newCompensations = get().compensations;
    if (compResult.amount > 0) {
      const newComp: Compensation = {
        id: generateId(),
        lendingRecordId: recordId,
        amount: compResult.amount,
        reason: compResult.reason,
        status: 'pending',
        createdAt: getTodayString(),
      };
      newCompensations = [...newCompensations, newComp];
      saveCompensations(newCompensations);
    }

    const device = get().devices.find((d) => d.id === record.deviceId);
    if (device) {
      const newStatus: DeviceStatus = returnBattery < 20 ? 'low_battery' : 'available';
      const newDevices = get().devices.map((d) =>
        d.id === record.deviceId
          ? { ...d, currentBattery: returnBattery, status: newStatus, updatedAt: getTodayString() }
          : d
      );
      saveDevices(newDevices);
      set({ devices: newDevices });
    }

    set({
      lendingRecords: newRecords,
      compensations: newCompensations,
    });
  },

  updateCompensationStatus: (id, status) => {
    const newCompensations = get().compensations.map((c) =>
      c.id === id ? { ...c, status } : c
    );
    saveCompensations(newCompensations);
    set({ compensations: newCompensations });
  },

  updateOverdueStatus: () => {
    const newRecords = get().lendingRecords.map((r) => {
      if (r.status === 'active' && isOverdue(r.expectedReturnDate)) {
        return { ...r, status: 'overdue' as const };
      }
      return r;
    });
    saveLendingRecords(newRecords);
    set({ lendingRecords: newRecords });
  },
}));
