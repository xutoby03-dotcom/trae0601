import { create } from 'zustand';
import {
  Device,
  BorrowRecord,
  Room,
  DashboardStats,
  ConnectorType,
  BorrowFormData,
  ReturnFormData,
  DeviceStatus,
} from '@/types';
import { devices as initialDevices } from '@/data/devices';
import { borrowRecords as initialRecords } from '@/data/records';
import { rooms } from '@/data/rooms';

interface AppState {
  devices: Device[];
  borrowRecords: BorrowRecord[];
  rooms: Room[];
  
  getDashboardStats: () => DashboardStats;
  getDeviceById: (id: string) => Device | undefined;
  getRecordsByDeviceId: (deviceId: string) => BorrowRecord[];
  getActiveRecords: () => BorrowRecord[];
  getRecentRecords: (limit?: number) => BorrowRecord[];
  
  addBorrowRecord: (data: BorrowFormData & { deviceId: string }) => void;
  returnDevice: (recordId: string, returnData: ReturnFormData) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (device: Device) => void;
  deleteDevice: (deviceId: string) => void;
  
  getBorrowedByMe: (name: string) => BorrowRecord[];
  getOverdueRecords: () => BorrowRecord[];
  getFaultyDevices: () => Device[];
  
  getHighDemandTypes: () => { type: ConnectorType; count: number; deficit: number }[];
}

export const useStore = create<AppState>((set, get) => ({
  devices: initialDevices,
  borrowRecords: initialRecords,
  rooms,
  
  getDashboardStats: () => {
    const { devices, borrowRecords } = get();
    const now = new Date();
    const nowTime = now.getTime();
    
    const activeRecords = borrowRecords.filter((r) => {
      const startTime = new Date(r.startTime).getTime();
      const endTime = new Date(r.endTime).getTime();
      return (
        (r.status === 'borrowed' || r.status === 'pending') &&
        startTime <= nowTime &&
        nowTime < endTime
      );
    });
    
    const overdueRecords = borrowRecords.filter(
      (r) =>
        (r.status === 'borrowed' || r.status === 'pending') &&
        new Date(r.endTime) < now
    );
    
    const faultyDevices = devices.filter(
      (d) => d.status === 'faulty' || d.status === 'maintenance'
    );
    
    const highDemandTypes = get().getHighDemandTypes();
    
    return {
      totalBorrowed: activeRecords.length,
      overdueCount: overdueRecords.length,
      faultyCount: faultyDevices.length,
      highDemandTypes,
    };
  },
  
  getDeviceById: (id) => {
    return get().devices.find((d) => d.id === id);
  },
  
  getRecordsByDeviceId: (deviceId) => {
    return get()
      .borrowRecords.filter((r) => r.deviceId === deviceId)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  },
  
  getActiveRecords: () => {
    const now = new Date();
    const nowTime = now.getTime();
    return get().borrowRecords.filter((r) => {
      const startTime = new Date(r.startTime).getTime();
      const endTime = new Date(r.endTime).getTime();
      return (
        (r.status === 'borrowed' || r.status === 'pending') &&
        startTime <= nowTime &&
        nowTime < endTime
      );
    });
  },
  
  getRecentRecords: (limit) => {
    const records = [...get().borrowRecords].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    return limit ? records.slice(0, limit) : records;
  },
  
  addBorrowRecord: (data) => {
    const newRecord: BorrowRecord = {
      id: `br${Date.now()}`,
      deviceId: data.deviceId,
      borrowerName: data.borrowerName,
      borrowerDept: data.borrowerDept,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      status: 'borrowed',
    };
    
    set((state) => ({
      borrowRecords: [...state.borrowRecords, newRecord],
      devices: state.devices.map((d) =>
        d.id === data.deviceId ? { ...d, status: 'borrowed' as DeviceStatus } : d
      ),
    }));
  },
  
  returnDevice: (recordId, returnData) => {
    const record = get().borrowRecords.find((r) => r.id === recordId);
    if (!record) return;
    
    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'returned',
              actualReturnTime: new Date().toISOString(),
              appearanceCheck: returnData.appearanceCheck,
              projectionOK: returnData.projectionOK,
              pouchPresent: returnData.pouchPresent,
              returnNotes: returnData.returnNotes,
            }
          : r
      ),
      devices: state.devices.map((d) =>
        d.id === record.deviceId ? { ...d, status: 'available' as DeviceStatus } : d
      ),
    }));
  },
  
  updateDeviceStatus: (deviceId, status) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === deviceId ? { ...d, status } : d
      ),
    }));
  },
  
  addDevice: (device) => {
    const newDevice: Device = {
      ...device,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      devices: [...state.devices, newDevice],
    }));
  },
  
  updateDevice: (device) => {
    set((state) => ({
      devices: state.devices.map((d) => (d.id === device.id ? device : d)),
    }));
  },
  
  deleteDevice: (deviceId) => {
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== deviceId),
    }));
  },
  
  getBorrowedByMe: (name) => {
    return get()
      .borrowRecords.filter((r) => r.borrowerName === name)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  },
  
  getOverdueRecords: () => {
    const now = new Date();
    return get()
      .borrowRecords.filter(
        (r) =>
          (r.status === 'borrowed' || r.status === 'pending') &&
          new Date(r.endTime) < now
      )
      .sort(
        (a, b) =>
          new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      );
  },
  
  getFaultyDevices: () => {
    return get().devices.filter(
      (d) => d.status === 'faulty' || d.status === 'maintenance'
    );
  },
  
  getHighDemandTypes: () => {
    const { devices, borrowRecords } = get();
    const now = new Date();
    const nowTime = now.getTime();
    
    const typeStats: Record<
      string,
      { total: number; borrowed: number }
    > = {};
    
    for (const device of devices) {
      if (!typeStats[device.type]) {
        typeStats[device.type] = { total: 0, borrowed: 0 };
      }
      typeStats[device.type].total++;
    }
    
    const activeRecords = borrowRecords.filter((r) => {
      const startTime = new Date(r.startTime).getTime();
      const endTime = new Date(r.endTime).getTime();
      return (
        (r.status === 'borrowed' || r.status === 'pending') &&
        startTime <= nowTime &&
        nowTime < endTime
      );
    });
    
    for (const record of activeRecords) {
      const device = devices.find((d) => d.id === record.deviceId);
      if (device) {
        typeStats[device.type].borrowed++;
      }
    }
    
    const result = Object.entries(typeStats)
      .map(([type, stats]) => ({
        type: type as ConnectorType,
        count: stats.borrowed,
        deficit: Math.max(0, stats.borrowed - Math.floor(stats.total / 2)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return result;
  },
}));
