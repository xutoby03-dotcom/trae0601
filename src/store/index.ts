import { create } from 'zustand';
import type { Device, Inspection, MaintenanceTask } from '@/constants';
import { storage } from '@/utils/storage';
import { mockDevices, mockInspections, generateMockTasks } from '@/utils/mockData';
import { generateId, getBatteryDaysRemaining, getNextBatteryReplaceDate, isInspectedThisMonth, todayStr } from '@/utils/dateUtils';
import { detectAnomalies, anomaliesToTasks, buildInspectionAnomalyTypes } from '@/utils/anomalyDetector';

interface AppState {
  devices: Device[];
  inspections: Inspection[];
  tasks: MaintenanceTask[];
  initialized: boolean;

  initData: () => void;

  addDevice: (d: Omit<Device, 'id' | 'created_at'>) => Device;
  updateDevice: (id: string, d: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getDevice: (id: string) => Device | undefined;

  addInspection: (data: Omit<Inspection, 'id' | 'has_anomaly' | 'anomaly_types' | 'created_at'>) => { inspection: Inspection; newTasks: MaintenanceTask[] };
  getInspectionsByDevice: (deviceId: string) => Inspection[];
  isDeviceInspectedThisMonth: (deviceId: string) => boolean;

  addTask: (t: Omit<MaintenanceTask, 'id' | 'created_at'>) => MaintenanceTask;
  updateTask: (id: string, patch: Partial<MaintenanceTask>) => void;
  getTasksByDevice: (deviceId: string) => MaintenanceTask[];
  getPendingTaskCount: (deviceId: string) => number;
  hasAnomaly: (deviceId: string) => boolean;
  getBatteryStatus: (device: Device) => { days: number; level: 'ok' | 'warning' | 'danger'; nextDate: string };
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  inspections: [],
  tasks: [],
  initialized: false,

  initData: () => {
    if (storage.isInitialized()) {
      set({
        devices: storage.getDevices(),
        inspections: storage.getInspections(),
        tasks: storage.getTasks(),
        initialized: true,
      });
      return;
    }
    const devices = mockDevices;
    const inspections = mockInspections;
    const tasks = generateMockTasks(inspections);
    storage.setDevices(devices);
    storage.setInspections(inspections);
    storage.setTasks(tasks);
    storage.setInitialized(true);
    set({ devices, inspections, tasks, initialized: true });
  },

  addDevice: (d) => {
    const device: Device = { ...d, id: generateId(), created_at: todayStr() };
    const devices = [...get().devices, device];
    storage.setDevices(devices);
    set({ devices });
    return device;
  },

  updateDevice: (id, patch) => {
    const devices = get().devices.map(d => (d.id === id ? { ...d, ...patch } : d));
    storage.setDevices(devices);
    set({ devices });
  },

  deleteDevice: (id) => {
    const devices = get().devices.filter(d => d.id !== id);
    const inspections = get().inspections.filter(i => i.device_id !== id);
    const tasks = get().tasks.filter(t => t.device_id !== id);
    storage.setDevices(devices);
    storage.setInspections(inspections);
    storage.setTasks(tasks);
    set({ devices, inspections, tasks });
  },

  getDevice: (id) => get().devices.find(d => d.id === id),

  addInspection: (data) => {
    const anomalies = detectAnomalies(data);
    const has_anomaly = anomalies.length > 0;
    const anomaly_types = buildInspectionAnomalyTypes(anomalies);
    const inspection: Inspection = {
      ...data,
      id: generateId(),
      has_anomaly,
      anomaly_types,
      created_at: todayStr(),
    };
    const inspections = [inspection, ...get().inspections];
    storage.setInspections(inspections);

    let newTasks: MaintenanceTask[] = [];
    if (has_anomaly) {
      newTasks = anomaliesToTasks(anomalies, data.device_id, inspection.id);
      const tasks = [...newTasks, ...get().tasks];
      storage.setTasks(tasks);
      set({ inspections, tasks });
    } else {
      set({ inspections });
    }
    return { inspection, newTasks };
  },

  getInspectionsByDevice: (deviceId) =>
    get().inspections
      .filter(i => i.device_id === deviceId)
      .sort((a, b) => new Date(b.inspect_date).getTime() - new Date(a.inspect_date).getTime()),

  isDeviceInspectedThisMonth: (deviceId) => {
    return get()
      .getInspectionsByDevice(deviceId)
      .some(i => isInspectedThisMonth(i.inspect_date));
  },

  addTask: (t) => {
    const task: MaintenanceTask = { ...t, id: generateId(), created_at: todayStr() };
    const tasks = [task, ...get().tasks];
    storage.setTasks(tasks);
    set({ tasks });
    return task;
  },

  updateTask: (id, patch) => {
    const tasks = get().tasks.map(t => (t.id === id ? { ...t, ...patch } : t));
    storage.setTasks(tasks);
    set({ tasks });
  },

  getTasksByDevice: (deviceId) =>
    get()
      .tasks.filter(t => t.device_id === deviceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),

  getPendingTaskCount: (deviceId) =>
    get().tasks.filter(t => t.device_id === deviceId && t.status !== 'done').length,

  hasAnomaly: (deviceId) => get().getPendingTaskCount(deviceId) > 0,

  getBatteryStatus: (device) => {
    const days = getBatteryDaysRemaining(device.battery_replace_date, device.battery_type);
    let level: 'ok' | 'warning' | 'danger' = 'ok';
    if (days <= 7) level = 'danger';
    else if (days <= 30) level = 'warning';
    const nextDate = getNextBatteryReplaceDate(device.battery_replace_date, device.battery_type);
    return { days, level, nextDate };
  },
}));
