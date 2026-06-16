import { create } from 'zustand';
import { Device } from '@/types';
import { mockDevices } from '@/data/devices';

interface DeviceStore {
  devices: Device[];
  getDeviceById: (id: string) => Device | undefined;
  getDevicesByBuilding: (building: string) => Device[];
  getDevicesByFloor: (building: string, floor: string) => Device[];
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getBuildings: () => string[];
  getFloors: (building: string) => string[];
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: mockDevices,

  getDeviceById: (id) => {
    return get().devices.find(d => d.id === id);
  },

  getDevicesByBuilding: (building) => {
    return get().devices.filter(d => d.building === building);
  },

  getDevicesByFloor: (building, floor) => {
    return get().devices.filter(d => d.building === building && d.floor === floor);
  },

  addDevice: (device) => {
    const newDevice: Device = {
      ...device,
      id: 'dev' + Date.now().toString(36),
      createdAt: new Date().toISOString().split('T')[0]
    };
    set(state => ({ devices: [...state.devices, newDevice] }));
  },

  updateDevice: (id, device) => {
    set(state => ({
      devices: state.devices.map(d =>
        d.id === id ? { ...d, ...device } : d
      )
    }));
  },

  deleteDevice: (id) => {
    set(state => ({
      devices: state.devices.filter(d => d.id !== id)
    }));
  },

  getBuildings: () => {
    const buildings = [...new Set(get().devices.map(d => d.building))];
    return buildings.sort();
  },

  getFloors: (building) => {
    const floors = [...new Set(get().devices.filter(d => d.building === building).map(d => d.floor))];
    return floors.sort();
  }
}));
