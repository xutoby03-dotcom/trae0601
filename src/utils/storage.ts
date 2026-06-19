import type { Device, Inspection, MaintenanceTask } from '@/constants';

const KEYS = {
  DEVICES: 'gas_alarm_devices',
  INSPECTIONS: 'gas_alarm_inspections',
  TASKS: 'gas_alarm_tasks',
  INIT_FLAG: 'gas_alarm_initialized',
};

const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeSet = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const storage = {
  // Devices
  getDevices: (): Device[] => safeGet<Device[]>(KEYS.DEVICES, []),
  setDevices: (devices: Device[]) => safeSet(KEYS.DEVICES, devices),

  // Inspections
  getInspections: (): Inspection[] => safeGet<Inspection[]>(KEYS.INSPECTIONS, []),
  setInspections: (inspections: Inspection[]) => safeSet(KEYS.INSPECTIONS, inspections),

  // Tasks
  getTasks: (): MaintenanceTask[] => safeGet<MaintenanceTask[]>(KEYS.TASKS, []),
  setTasks: (tasks: MaintenanceTask[]) => safeSet(KEYS.TASKS, tasks),

  // Init flag
  isInitialized: (): boolean => localStorage.getItem(KEYS.INIT_FLAG) === 'true',
  setInitialized: (v = true) => localStorage.setItem(KEYS.INIT_FLAG, String(v)),
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
